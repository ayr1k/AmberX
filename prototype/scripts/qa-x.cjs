const { _electron:electron }=require('C:/Users/lempi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs/promises');
(async()=>{
 const root=path.resolve(__dirname,'..'),qa=path.join(root,'.qa','x-'+Date.now());await fs.mkdir(qa,{recursive:true});
 const env={...process.env,AMBER_SMOKE_ROOT:path.join(qa,'data')};delete env.ELECTRON_RUN_AS_NODE;
 const app=await electron.launch({executablePath:path.join(root,'node_modules/electron/dist/electron.exe'),args:[root,'--qa-ui','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding'],env,timeout:30000});
 const page=await app.firstWindow();await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.setSize(1360,900);w.webContents.setBackgroundThrottling(false);});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const shot=async name=>{await page.waitForTimeout(350);const b=await app.evaluate(async({BrowserWindow})=>(await BrowserWindow.getAllWindows()[0].webContents.capturePage(undefined,{stayHidden:true,stayAwake:true})).toPNG().toString('base64'));await fs.writeFile(path.join(qa,name+'.png'),Buffer.from(b,'base64'));};
 await page.waitForSelector('.goal-card');await shot('home');
 console.log('QA_DIR',qa);console.log('INFO',await page.evaluate(()=>window.amberDesktop.info()));
 await page.locator('.goal-card').first().click();await page.waitForSelector('.recipe-sheet');await shot('recipe');
 console.log('SELECT',await page.locator('.sentence label').first().evaluate(el=>getComputedStyle(el).userSelect));
 await page.getByRole('button',{name:'偏好',exact:true}).click();await page.getByRole('button',{name:'Language',exact:true}).click();await page.getByRole('option',{name:'English',exact:true}).click();await page.getByRole('heading',{name:'Make the lab yours.'}).waitFor();
 await page.getByRole('button',{name:'Dark',exact:true}).click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');await page.getByRole('button',{name:'Start',exact:true}).click();await shot('home-dark-en');
 for(const zoom of [1,1.25,1.5,2]){await app.evaluate(({BrowserWindow},z)=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(z),zoom);await shot('scale-'+zoom);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Horizontal overflow at '+zoom);}
 console.log('ERRORS',errors);await app.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

