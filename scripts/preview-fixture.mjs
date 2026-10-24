// Render the production handler into a bounded, credential-free browser fixture.
import worker from '../src/worker.mjs';
import { encode } from '../public/codec.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const directory=new URL('../artifacts/browser-fixture/',import.meta.url);
await mkdir(directory,{recursive:true});
const codes=[encode([]),encode([27]),encode([27,94,95]),encode([94,95]),encode([89]),encode([27,89])].map(code=>code.slice(1));
const paths=['/','/about','/v1','/assets/site.css?v=2','/assets/app.mjs?v=2','/assets/codec.mjs?v=2','/favicon.svg','/lookup?code=1/Y_3'];
for(const code of codes){
 paths.push('/1/'+code,'/?code=1/'+code,'/qr/1/'+code+'.svg');
 for(const mm of [10,12,16,24])paths.push(`/qr/1/${code}.svg?mm=${mm}`,`/qr/1/${code}.svg?mm=${mm}&download=1`);
}
const routes={};
for(const path of paths){const r=worker.fetch(new Request('https://aiused.org'+path));routes[path]={status:r.status,headers:Object.fromEntries(r.headers),body:await r.text()};}
await writeFile(new URL('routes.json',directory),JSON.stringify(routes));
const plan={timeout_seconds:100,steps:[
 {action:'open',url:'/'},{action:'assert_text',selector:'h1',text:'AI used.'},{action:'capture',name:'home'},
 {action:'click',selector:'[data-preset="27,94,95"]'},{action:'assert_text',selector:'#code',text:'Y_3'},
 {action:'fill',selector:'#search',text:'outpainting'},{action:'assert_text',selector:'#search-count',text:'1 matching declarations'},
 {action:'click',selector:'input[value="27"]'},{action:'assert_text',selector:'#code',text:encode([94,95]).slice(1)},
 {action:'click',selector:'#view-citation'},{action:'assert_text',selector:'.declarations',text:'Human revision'},{action:'capture',name:'citation'},
 {action:'open',url:'/'},{action:'click',selector:'[data-preset="89"]'},
 {action:'fill',selector:'#search',text:'outpainting'},{action:'click',selector:'input[value="27"]'},
 {action:'assert_text',selector:'#conflicts',text:'conflicts with the selected known AI actions'},{action:'capture',name:'conflict'},
 {action:'open',url:'/1/Y_3'},{action:'assert_text',selector:'.declarations',text:'Outpainting'},{action:'capture',name:'example'},
]};
await writeFile(new URL('fixture-plan.json',directory),JSON.stringify(plan));
console.log(`Rendered ${paths.length} fixture responses; production not contacted.`);
