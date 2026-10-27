// SPDX-License-Identifier: MPL-2.0
import {randomUUID,createHash} from 'node:crypto';
import {join} from 'node:path';
import {readFile,unlink} from 'node:fs/promises';
import {atomicJson} from './core.mjs';
import {readBoundedFile} from './bounded-io.mjs';
import {utilityChoices} from './guided-catalog.mjs';
import {answers} from './guided-model.mjs';

export const goals=['responsive','comfort','scenery'];
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function recipe(value={}){
 if(!goals.includes(value.goal))throw Error('请选择一个实验目标 / Choose a goal.');
 if(value.sourceId!=null&&(typeof value.sourceId!=='string'||!/^[a-f\d-]{36}$/.test(value.sourceId)))throw Error('实例编号无效 / Invalid instance.');
 if(!['unknown','integrated','dedicated'].includes(value.gpu||'unknown'))throw Error('显卡选项无效 / Invalid GPU.');
 if(value.goal==='scenery'&&value.sourceId)throw Error('远景实验需要新建实例；现有实例仅支持补装便利和性能模组 / Start scenery in a clean instance.');
 const locks=value.locks||{};
 if(typeof locks.game!=='undefined'&&(typeof locks.game!=='string'||! /^[\w.+-]{0,80}$/.test(locks.game)))throw Error('版本条件无效 / Invalid version lock.');
 if(locks.loader&&!['vanilla','fabric','forge','neoforge'].includes(locks.loader))throw Error('加载器条件无效 / Invalid loader lock.');
 const selected=value.features??(value.goal==='comfort'?['recipes','identify','food','inventory']:[]),required=locks.features||[];
 for(const list of [selected,required])if(!Array.isArray(list)||list.length>8||list.some(x=>!utilityChoices.includes(x)))throw Error('功能条件无效 / Invalid feature lock.');
 if(required.some(x=>!selected.includes(x)))throw Error('锁定功能必须同时选中 / Select each locked feature.');
 if(value.play&&!['single','server'].includes(value.play))throw Error('游玩方式无效 / Invalid play mode.');
 return {goal:value.goal,sourceId:value.sourceId||null,gpu:value.gpu||'unknown',shaders:value.shaders===true,copySaves:value.copySaves===true,play:value.play||'single',features:[...new Set(selected)],locks:{game:locks.game||'',loader:locks.loader||'',features:[...new Set(required)]}};
}
export function goalAnswers(value){
 const r=recipe(value);
 return answers({priority:r.goal==='responsive'?'performance':r.goal==='scenery'?'visual':'balanced',change:'light',features:r.features,requiredFeatures:r.locks.features,play:r.play,serverVersion:r.locks.game,serverLoader:r.locks.loader||'unknown',targetLocked:true,content:[r.goal==='scenery'?'exploration':'survival'],gpu:r.gpu,shaders:r.goal==='scenery'&&r.shaders?'on':'off',lod:r.goal==='scenery'?'auto':'off',freshness:'stable',hud:'simple',gameplay:[],texture:'vanilla'});
}
export function planStamp(p){return hash({target:p.target,files:p.files.map(f=>[f.projectId,f.versionId,f.relative,f.hash]).sort((a,b)=>String(a).localeCompare(String(b)))});}
export class Experiments{
 constructor(core,guided,workbench,workflows){this.core=core;this.guided=guided;this.workbench=workbench;this.workflows=workflows;this.path=join(core.root,'amberx-experiments.json');this.records=[];this.active=false;}
 async init(){try{const raw=JSON.parse(await readBoundedFile(this.path,32000000));if(raw.schema!==1||!Array.isArray(raw.records)||raw.records.length>200)throw Error('实验记录损坏 / Experiment records are invalid.');this.records=raw.records;}catch(e){if(e.code!=='ENOENT')throw e;}for(const r of this.records){if(r.state==='updating'){r.state='review';r.error='方案调整被中断，已保留原方案 / Adjustment interrupted; original plans retained.';}}for(const r of this.records)if(['planning','copying','installing'].includes(r.state)){const wasInstalling=r.state==='installing';r.state='interrupted';if(wasInstalling&&r.instanceId&&r.instanceId!==r.recipe.sourceId){try{const {dir}=await this.core.metadata(r.instanceId);const report=JSON.parse(await readFile(join(dir,r.recipe.sourceId?'content-task.json':'setup-report.json'),'utf8'));if(report.state==='done')r.state='installed';}catch{}}}await this.save();}
 save(){const snapshot=structuredClone({schema:1,records:this.records});this.saving=(this.saving||Promise.resolve()).catch(()=>{}).then(()=>atomicJson(this.path,snapshot));return this.saving;}
 list(){return structuredClone(this.records);}
 find(id){const r=this.records.find(r=>r.id===id);if(!r)throw Error('实验不存在 / Experiment not found.');return r;}
 async lock(fn){if(this.active||this.workflows.active)throw Error('请等待当前任务结束 / Wait for the current task.');this.active=true;try{return await fn();}finally{this.active=false;}}
 async fingerprint(id){const {dir,item}=await this.core.metadata(id);await this.core.requireStopped(dir);return hash({target:[item.game,item.loader,item.loaderVersion],files:await this.workbench.scan(dir)});}
 async generate(input){return this.lock(async()=>{
  if(this.records.length>=200)throw Error('已达到 200 个实验记录 / Experiment limit reached.');
  const value=recipe(input),r={id:randomUUID(),recipe:value,state:'planning',createdAt:new Date().toISOString(),plans:[]};this.records.unshift(r);await this.save();
  try{if(value.sourceId){r.sourceFingerprint=await this.fingerprint(value.sourceId);const {item}=await this.core.metadata(value.sourceId);r.source={name:item.name,game:item.game,loader:item.loader,loaderVersion:item.loaderVersion};}r.plans=await (value.sourceId?this.guided.recommendAddon(value.sourceId,goalAnswers(value)):this.guided.recommend(goalAnswers(value)));r.plans=r.plans.map(p=>this.decorate(p,value));r.state='review';return structuredClone(r);}catch(e){r.state='failed';r.error=e.message;throw e;}finally{await this.save();}
 });}
 async prepare(id,kind){return this.lock(async()=>{
  const r=this.find(id);if(r.state!=='review'&&!(r.state==='interrupted'&&r.instanceId&&r.recipe.sourceId))throw Error('请重新生成并审阅方案 / Generate and review a fresh plan.');
  const p=r.plans.find(p=>p.kind===kind);if(!p)throw Error('请选择方案 / Choose a plan.');
  this.assertPlan(p);r.selected=kind;r.plan=p;r.recipe=recipe(p.recipe||r.recipe);
  if(!r.recipe.sourceId){r.state='ready';await this.save();return structuredClone(r);}
  if(!r.instanceId&&r.sourceFingerprint!==await this.fingerprint(r.recipe.sourceId))throw Error('原实例已改变，请重新生成方案 / Source changed. Generate a new plan.');
  r.state='copying';await this.save();
  try{
   this.workflows.onTrialCreated=async id=>{r.instanceId=id;await this.save();};
   const copy=r.instanceId?{id:r.instanceId}:await this.workbench.createTrial(r.recipe.sourceId,{saves:r.recipe.copySaves,name:'X · '+r.recipe.goal,experimentId:r.id});r.instanceId=copy.id;await this.save();
   // Regenerate against the actual copy. Never reuse an original-bound install plan.
   const plans=await this.guided.recommendAddon(copy.id,goalAnswers({...r.recipe,sourceId:copy.id}));
   const rebound=plans.find(p=>p.kind===(r.plan.baseKind||kind));if(!rebound)throw Error('副本没有对应方案，请保留副本后重新实验 / No matching plan for the copy.');
   r.planChanged=planStamp(p)!==planStamp(rebound);r.plan=this.decorate({...rebound,kind,baseKind:r.plan.baseKind||kind},r.recipe);r.state='ready';return structuredClone(r);
  }catch(e){r.state='interrupted';r.error=e.message;throw e;}finally{this.workflows.onInstanceCreated=null;this.workflows.onTrialCreated=null;await this.save();}
 });}
 assertPlan(p){if(p.blockers?.length||p.issues?.errors?.length)throw Error('方案存在阻断问题，请返回修改目标 / Plan is blocked. Revise the goal.');}
 async install(id,acknowledge){return this.lock(async()=>{
  const r=this.find(id);if(r.state!=='ready'||acknowledge!==true)throw Error('请先审阅并确认安装清单 / Review and confirm the file list.');this.assertPlan(r.plan);
  r.state='installing';delete r.error;await this.save();
  try{
   if(!r.recipe.sourceId){this.workflows.lastSetup=null;this.workflows.onInstanceCreated=async id=>{r.instanceId=id;await this.save();};}
   // create()/runAddon() recheck inside the exclusive workflow after resetting cancellation.
   // A cancelled previous workflow must not poison the next installation.
   this.guided.plans.set(r.plan.id,{...r.plan,expiresAt:Date.now()+30*60000});
   if(r.recipe.sourceId){if(!r.instanceId||r.instanceId===r.recipe.sourceId||r.plan.existing?.id!==r.instanceId)throw Error('副本目标不匹配 / Trial target mismatch.');await this.guided.installAddon(r.plan.id,true);}
   else {await this.guided.create(r.plan.id,{name:'X · '+r.plan.target.game+'-'+r.plan.target.loader,acknowledge:true});r.instanceId=this.workflows.lastSetup;}
   r.state='installed';return structuredClone(r);
  }catch(e){if(!r.recipe.sourceId&&this.workflows.lastSetup)r.instanceId=this.workflows.lastSetup;r.state='interrupted';r.error=e.message;throw e;}finally{this.workflows.onInstanceCreated=null;this.workflows.onTrialCreated=null;await this.save();}
 });}
 async resume(id){return this.lock(async()=>{const r=this.find(id);if(!r.instanceId||r.instanceId===r.recipe.sourceId)throw Error('尚未生成安装任务，请重新生成方案 / Generate a new plan.');const pending=(await this.workflows.pending()).find(p=>p.instanceId===r.instanceId);if(!pending)throw Error('没有可恢复的安装任务，可保留副本并重新生成方案 / No pending installation.');r.state='installing';await this.save();try{await this.workflows.retry(r.instanceId);r.state='installed';delete r.error;return structuredClone(r);}catch(e){r.state='interrupted';r.error=e.message;throw e;}finally{await this.save();}});}
 async feedback(id,result,note){return this.lock(async()=>{const r=this.find(id);if(!['installed','feedback'].includes(r.state)||!['better','same','worse'].includes(result)||typeof note!=='string'||note.length>1000)throw Error('反馈无效 / Invalid feedback.');r.feedback={result,note,at:new Date().toISOString(),kind:'user-reported'};r.state='feedback';await this.save();return structuredClone(r);});}
 decorate(p,input){const r=recipe(input),missing=r.locks.features.filter(k=>!p.roots?.some(f=>f.feature===k));const mismatch=(r.locks.game&&r.locks.game!==p.target.game)||(r.locks.loader&&r.locks.loader!==p.target.loader);return {...p,recipe:r,checkedAt:new Date().toISOString(),lockMissing:missing,blockers:[...(p.blockers||[]),...(missing.length||mismatch?['lockedConditionUnavailable']:[])]};}
 async adjust(id,fromKind,toKind,input){return this.lock(async()=>{
  const r=this.find(id);if(r.state!=='review'||r.instanceId)throw Error('开始安装后请创建新实验 / Start a new experiment after preparation.');
  const from=r.plans.find(p=>p.kind===fromKind);if(!from||!['conservative','balanced','aggressive'].includes(toKind)||fromKind===toKind)throw Error('请选择另一个方案位置 / Choose another desk slot.');
  const value=recipe(input);if(value.sourceId!==r.recipe.sourceId)throw Error('比较必须使用相同起点 / Keep the same starting instance.');
  r.state='updating';delete r.error;await this.save();
  try{if(value.sourceId&&r.sourceFingerprint!==await this.fingerprint(value.sourceId))throw Error('原实例已改变，请创建新实验 / Source changed. Start a new experiment.');
   const plans=await (value.sourceId?this.guided.recommendAddon(value.sourceId,goalAnswers(value)):this.guided.recommend(goalAnswers(value)));
   const p=plans.find(p=>p.kind===(from.baseKind||from.kind));if(!p)throw Error('没有满足条件的方案，原方案已保留 / No matching setup; original retained.');
   r.previousPlans=structuredClone(r.plans);r.plans=r.plans.filter(p=>p.kind!==toKind);r.plans.push(this.decorate({...p,kind:toKind,baseKind:from.baseKind||from.kind,custom:true},value));r.change={from:fromKind,to:toKind,at:new Date().toISOString()};
  }catch(e){r.error=e.message;throw e;}finally{r.state='review';await this.save();}return structuredClone(r);
 });}
 async undo(id){return this.lock(async()=>{const r=this.find(id);if(r.state!=='review'||!r.previousPlans)throw Error('没有可撤销的调整 / No adjustment to undo.');r.plans=r.previousPlans;delete r.previousPlans;delete r.change;delete r.error;await this.save();return structuredClone(r);});}
 async recoverPreparation(id){const r=this.find(id);if(r.state!=='interrupted'||!r.instanceId||!r.recipe.sourceId||r.instanceId===r.recipe.sourceId)throw Error('没有可重新检查的副本 / No copy to recheck.');if((await this.workflows.pending()).some(p=>p.instanceId===r.instanceId))throw Error('请使用继续安装 / Resume the installation instead.');return this.prepare(id,r.selected);}
 async launched(instanceId){const r=this.records.find(r=>r.instanceId===instanceId&&['installed','feedback'].includes(r.state));if(r){r.launchedAt=new Date().toISOString();await this.save();}}
 async keep(id){return this.lock(async()=>{const r=this.find(id);if(!['installed','feedback','kept'].includes(r.state)||!r.instanceId)throw Error('请先完成安装 / Complete installation first.');const {dir}=await this.workbench.ready(r.instanceId);await atomicJson(join(dir,'x-kept.json'),{experimentId:r.id,at:new Date().toISOString()});if(r.recipe.sourceId){try{await unlink(join(dir,'trial.json'));}catch(e){if(e.code!=='ENOENT')throw e;}}r.state='kept';r.keptAt=new Date().toISOString();await this.save();return structuredClone(r);});}
 async review(id,value){return this.lock(async()=>{const r=this.find(id);if(!['installed','feedback','kept'].includes(r.state)||!r.launchedAt)throw Error('请先启动试用 / Launch the trial first.');const {dir}=await this.core.metadata(r.instanceId);await this.core.requireStopped(dir);if(!value||!['good','okay','poor'].includes(value.smoothness)||!['like','adjust'].includes(value.visual)||!['none','crash','other'].includes(value.problem)||typeof value.note!=='string'||value.note.length>1000)throw Error('反馈无效 / Invalid feedback.');r.review={...value,at:new Date().toISOString(),kind:'user-reported'};if(r.state!=='kept')r.state='feedback';await this.save();return structuredClone(r);});}
 async reconcile(management){
  const live=await this.core.listInstances(),trash=await management.list(),activeIds=new Set(live.map(i=>i.id)),trashIds=new Set(trash.map(i=>i.id));
  for(const item of live){try{const {dir}=await this.core.metadata(item.id),trial=JSON.parse(await readBoundedFile(join(dir,'trial.json'),8000000));const r=this.records.find(r=>r.id===trial.experimentId&&!r.instanceId&&r.state==='interrupted');if(r&&trial.sourceId===r.recipe.sourceId)r.instanceId=item.id;}catch{}}
  for(const r of this.records){if(!r.instanceId)continue;if(trashIds.has(r.instanceId)){if(r.state!=='removed'){r.previousState=r.state;r.state='removed';}}else if(activeIds.has(r.instanceId)){if(['removed','missing'].includes(r.state)){r.state=r.previousState||'interrupted';delete r.previousState;}try{const {dir}=await this.core.metadata(r.instanceId),kept=JSON.parse(await readBoundedFile(join(dir,'x-kept.json'),10000));if(kept.experimentId===r.id){r.state='kept';r.keptAt=kept.at;}}catch{}}else if(r.state==='removed'){r.state='deleted';delete r.previousState;}else if(!['missing','deleted'].includes(r.state)){r.previousState=r.state;r.state='missing';}}
  await this.save();
 }
 async manage(management,operation,id,confirmation){return this.lock(async()=>{if(!['remove','restore','purge'].includes(operation))throw Error('无效操作 / Invalid action.');const result=await management[operation](id,confirmation);for(const r of this.records.filter(r=>r.instanceId===id)){if(operation==='remove'){r.previousState=r.state;r.state='removed';}else if(operation==='restore'){r.state=r.previousState||'interrupted';delete r.previousState;}else{r.state='deleted';delete r.previousState;}}await this.save();return result;});}

}
