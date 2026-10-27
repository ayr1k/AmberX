// SPDX-License-Identifier: MPL-2.0
export function comparisonRows(plans){
 const keys=[...new Set(plans.flatMap(p=>(p.files||[]).map(f=>f.projectId)))];
 return keys.map(id=>{const values=plans.map(p=>(p.files||[]).find(f=>f.projectId===id)||null),first=values.find(Boolean);return {id,title:first.title||first.slug||id,values,different:values.some(f=>!f)||values.some(f=>f.versionId!==first.versionId||f.hash!==first.hash)};}).sort((a,b)=>Number(b.different)-Number(a.different)||a.title.localeCompare(b.title));
}
export const deskSlots=['conservative','balanced','aggressive'];
