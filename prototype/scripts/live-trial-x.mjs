import assert from 'node:assert/strict';import {resolve,join} from 'node:path';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {VanillaLauncher} from '../desktop/launcher.mjs';import {Modrinth} from '../desktop/modrinth.mjs';import {Workflows} from '../desktop/workflows.mjs';import {GuidedCreation} from '../desktop/guided.mjs';import {InstanceWorkbench} from '../desktop/instance-workbench.mjs';import {Experiments} from '../desktop/experiments.mjs';import {Accounts} from '../desktop/accounts.mjs';
const fixture=JSON.parse(await readFile(resolve('.qa/latest-live-x.json'),'utf8')),core=new VanillaLauncher(fixture.root);await core.init();const content=new Modrinth(core),flows=new Workflows(core,content),guided=new GuidedCreation(core,content,flows),bench=new InstanceWorkbench(core,flows);core.workbench=bench;const experiments=new Experiments(core,guided,bench,flows);await experiments.init();
const timer=setInterval(()=>console.log('PROGRESS',guided.generationStatus().phase,core.operation,core.jobs.filter(j=>j.state==='running').map(j=>j.phase)),15000);
try{
 const before=JSON.stringify(await bench.scan(await core.instancePath(fixture.id)));
 const r=await experiments.generate({goal:'comfort',sourceId:fixture.id});console.log('ADDON',r.plans.map(p=>({kind:p.kind,added:p.additions})));
 await experiments.prepare(r.id,'balanced');assert.notEqual(experiments.find(r.id).instanceId,fixture.id);await experiments.install(r.id,true);
 const record=experiments.find(r.id),after=JSON.stringify(await bench.scan(await core.instancePath(fixture.id)));assert.equal(after,before);console.log('SOURCE_UNCHANGED_AND_TRIAL_INSTALLED',record.instanceId);
 const accounts=new Accounts(fixture.root);const identity=await accounts.authorizeLaunch(null,'AmberX_QA');await content.validateLaunch(record.instanceId);const run=await core.launch(record.instanceId,{username:'AmberX_QA',memory:4,identity,extraJvm:[]});console.log('LAUNCH',run);
 let result;for(let n=0;n<45;n++){await new Promise(r=>setTimeout(r,1000));result=(await core.runtimeStatus()).processes.find(p=>p.instanceId===record.instanceId);if(result?.state==='failed')throw Error(result.error);if(/OpenAL initialized|Sound engine started|Created:.*atlas|Reloading ResourceManager/.test(result?.tail||''))break;}
 await writeFile(resolve('.qa/live-launch-result.json'),JSON.stringify({record,process:{...result,tail:result?.tail}},null,2));
 assert.equal(result?.state,'running');assert.match(result?.tail||'',/OpenAL initialized|Sound engine started|Created:.*atlas|Reloading ResourceManager/);console.log('GAME_RENDER_INITIALIZED');
 // This is the isolated test game process created above, never a user's session.
 core.processes.get(run.id)?.child?.kill();
 await experiments.feedback(r.id,'same','QA smoke: separate trial launched; no performance claim.');
 await writeFile(resolve('.qa/latest-live-trial.json'),JSON.stringify({root:fixture.root,id:record.instanceId,experimentId:r.id},null,2));console.log('TRIAL_LOOP_OK');
}finally{clearInterval(timer);for(const p of core.processes.values())if(p.state==='running')p.child?.kill();}
