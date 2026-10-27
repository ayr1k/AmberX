// SPDX-License-Identifier: MPL-2.0
import {randomUUID,createHash} from 'node:crypto';
import {join} from 'node:path';
import {readFile} from 'node:fs/promises';
import {atomicJson} from './core.mjs';
import {answers} from './guided-model.mjs';

export const goals=['responsive','comfort','scenery'];
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function recipe(value={}){
 if(!goals.includes(value.goal))throw Error('请选择一个实验目标 / Choose a goal.');
 if(value.sourceId!=null&&(typeof value.sourceId!=='string'||!/^[a-f\d-]{36}$/.test(value.sourceId)))throw Error('实例编号无效 / Invalid instance.');
 if(!['unknown','integrated','dedicated'].includes(value.gpu||'unknown'))throw Error('显卡选项无效 / Invalid GPU.');
 if(value.goal==='scenery'&&value.sourceId)throw Error('远景实验需要新建实例；现有实例仅支持补装便利和性能模组 / Start scenery in a clean instance.');
 return {goal:value.goal,sourceId:value.sourceId||null,gpu:value.gpu||'unknown',shaders:value.shaders===true,copySaves:value.copySaves===true};
}
export function goalAnswers(value){
 const r=recipe(value);
 return answers({priority:r.goal==='responsive'?'performance':r.goal==='scenery'?'visual':'balanced',change:'light',features:r.goal==='comfort'?['recipes','identify','food','inventory']:[],content:[r.goal==='scenery'?'exploration':'survival'],gpu:r.gpu,shaders:r.goal==='scenery'&&r.shaders?'on':'off',lod:r.goal==='scenery'?'auto':'off',freshness:'stable',hud:'simple',gameplay:[],texture:'vanilla'});
}
export function planStamp(p){return hash({target:p.target,files:p.files.map(f=>[f.projectId,f.versionId,f.relative,f.hash]).sort((a,b)=>String(a).localeCompare(String(b)))});}
export class Experiments{
 constructor(core,guided,workbench,workflows){this.core=core;this.guided=guided;this.workbench=workbench;this.workflows=workflows;this.path=join(core.root,'amberx-experiments.json');this.records=[];this.active=false;}
 async init(){try{const raw=JSON.parse(await readFile(this.path,'utf8'));if(raw.schema!==1||!Array.isArray(raw.records)||raw.records.length>200)throw Error('实验记录损坏 / Experiment records are invalid.');this.records=raw.records;}catch(e){if(e.code!=='ENOENT')throw e;}for(const r of this.records)if(['planning','copying','installing'].includes(r.state)){const wasInstalling=r.state==='installing';r.state='interrupted';if(wasInstalling&&r.instanceId&&r.instanceId!==r.recipe.sourceId){try{const {dir}=await this.core.metadata(r.instanceId);const report=JSON.parse(await readFile(join(dir,r.recipe.sourceId?'content-task.json':'setup-report.json'),'utf8'));if(report.state==='done')r.state='installed';}catch{}}}await this.save();}
 save(){return atomicJson(this.path,{schema:1,records:this.records});}
 list(){return structuredClone(this.records);}
 find(id){const r=this.records.find(r=>r.id===id);if(!r)throw Error('实验不存在 / Experiment not found.');return r;}
 async lock(fn){if(this.active||this.workflows.active)throw Error('请等待当前任务结束 / Wait for the current task.');this.active=true;try{return await fn();}finally{this.active=false;}}
 async fingerprint(id){const {dir,item}=await this.core.metadata(id);await this.core.requireStopped(dir);return hash({target:[item.game,item.loader,item.loaderVersion],files:await this.workbench.scan(dir)});}
 async generate(input){return this.lock(async()=>{
  if(this.records.length>=200)throw Error('已达到 200 个实验记录 / Experiment limit reached.');
  const value=recipe(input),r={id:randomUUID(),recipe:value,state:'planning',createdAt:new Date().toISOString(),plans:[]};this.records.unshift(r);await this.save();
  try{if(value.sourceId){r.sourceFingerprint=await this.fingerprint(value.sourceId);const {item}=await this.core.metadata(value.sourceId);r.source={name:item.name,game:item.game,loader:item.loader,loaderVersion:item.loaderVersion};}r.plans=await (value.sourceId?this.guided.recommendAddon(value.sourceId,goalAnswers(value)):this.guided.recommend(goalAnswers(value)));r.state='review';return structuredClone(r);}catch(e){r.state='failed';r.error=e.message;throw e;}finally{await this.save();}
 });}
 async prepare(id,kind){return this.lock(async()=>{
  const r=this.find(id);if(r.state!=='review')throw Error('请重新生成并审阅方案 / Generate and review a fresh plan.');
  const p=r.plans.find(p=>p.kind===kind);if(!p)throw Error('请选择方案 / Choose a plan.');
  this.assertPlan(p);r.selected=kind;r.plan=p;
  if(!r.recipe.sourceId){r.state='ready';await this.save();return structuredClone(r);}
  if(r.sourceFingerprint!==await this.fingerprint(r.recipe.sourceId))throw Error('原实例已改变，请重新生成方案 / Source changed. Generate a new plan.');
  r.state='copying';await this.save();
  try{
   const copy=await this.workbench.createTrial(r.recipe.sourceId,{saves:r.recipe.copySaves,name:'X · '+r.recipe.goal});r.instanceId=copy.id;await this.save();
   // Regenerate against the actual copy. Never reuse an original-bound install plan.
   const plans=await this.guided.recommendAddon(copy.id,goalAnswers({...r.recipe,sourceId:copy.id}));
   const rebound=plans.find(p=>p.kind===kind);if(!rebound)throw Error('副本没有对应方案，请保留副本后重新实验 / No matching plan for the copy.');
   r.planChanged=planStamp(p)!==planStamp(rebound);r.plan=rebound;r.state='ready';return structuredClone(r);
  }catch(e){r.state='interrupted';r.error=e.message;throw e;}finally{this.workflows.onInstanceCreated=null;await this.save();}
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
  }catch(e){if(!r.recipe.sourceId&&this.workflows.lastSetup)r.instanceId=this.workflows.lastSetup;r.state='interrupted';r.error=e.message;throw e;}finally{this.workflows.onInstanceCreated=null;await this.save();}
 });}
 async resume(id){return this.lock(async()=>{const r=this.find(id);if(!r.instanceId||r.instanceId===r.recipe.sourceId)throw Error('尚未生成安装任务，请重新生成方案 / Generate a new plan.');const pending=(await this.workflows.pending()).find(p=>p.instanceId===r.instanceId);if(!pending)throw Error('没有可恢复的安装任务，可保留副本并重新生成方案 / No pending installation.');r.state='installing';await this.save();try{await this.workflows.retry(r.instanceId);r.state='installed';delete r.error;return structuredClone(r);}catch(e){r.state='interrupted';r.error=e.message;throw e;}finally{await this.save();}});}
 async feedback(id,result,note){return this.lock(async()=>{const r=this.find(id);if(!['installed','feedback'].includes(r.state)||!['better','same','worse'].includes(result)||typeof note!=='string'||note.length>1000)throw Error('反馈无效 / Invalid feedback.');r.feedback={result,note,at:new Date().toISOString(),kind:'user-reported'};r.state='feedback';await this.save();return structuredClone(r);});}
}
