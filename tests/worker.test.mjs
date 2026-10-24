import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import worker from '../src/worker.mjs';
import { encode, decode, disclosurePath, decodeVersioned, parseVersion } from '../public/codec.mjs';
import { catalog, catalogJSON, catalogHash } from '../src/catalog.mjs';
const get=(path,method='GET')=>worker.fetch(new Request('https://aiused.org'+path,{method}));

test('99 frozen categories and content hash',()=>{
 assert.equal(catalog.status,'published');
 assert.deepEqual(catalog.categories.map(c=>c.id),Array.from({length:99},(_,i)=>i+1));
 assert.equal(createHash('sha256').update(catalogJSON).digest('hex'),catalogHash);
 assert.equal(catalogHash,'b7a9416e5a019c09d5c2a5619c716fad0170809704da679ff33b8468271d96c5','Published v1 must never change');
});
test('citation is fully readable without script execution',async()=>{
 const response=get('/1/Y_3');assert.equal(response.status,200);
 const html=await response.text();
 const readable=html.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&');
 for(const id of [27,94,95])assert.ok(readable.includes(catalog.categories[id-1].description));
 assert.match(html,/aiused.org\/1\/Y_3/);assert.match(html,/Unselected categories are unclaimed/);
 assert.match(html,/<code>1\/Y_3<\/code>/);
 assert.match(html,/src="\/assets\/app\.mjs\?v=2"/);
 assert.match(html,/href="\/assets\/site\.css\?v=4"/);
 assert.match(response.headers.get('Content-Security-Policy'),/script-src 'self'/);
});
test('JSON preserves semantics and casing across extreme combinations',async()=>{
 for(const ids of [[],[27],[27,94,95],[36,54],Array.from({length:99},(_,i)=>i+1)]){
  const code=encode(ids).slice(1),response=get('/1/'+code+'.json');assert.equal(response.status,200);
  const data=await response.json();assert.deepEqual(data.category_ids,ids);assert.equal(data.code,code);
  assert.equal(data.vocabulary_version,'1');assert.equal(data.url,'https://aiused.org/1/'+code);
  assert.equal(data.vocabulary_sha256,catalogHash);
 }
});
test('versioned paths preserve the published code and redirect legacy URLs',()=>{
 assert.equal(disclosurePath([27,94,95]),'/1/Y_3');
 assert.deepEqual(decodeVersioned('1','Y_3'),[27,94,95]);
 assert.equal(parseVersion('1'),1n);
 for(const [oldPath,newPath] of [['/1Y_3','/1/Y_3'],['/1Y_3.json','/1/Y_3.json'],['/qr/1Y_3.svg?mm=10','/qr/1/Y_3.svg?mm=10']]){
  const response=get(oldPath);assert.equal(response.status,308,oldPath);assert.equal(response.headers.get('Location'),newPath);
 }
 for(const path of ['/2/Y_3','/01/Y_3','/1/0Y_3'])assert.equal(get(path).status,404,path);
});
test('invalid and injection-shaped inputs cannot become disclosures or redirects',()=>{
 for(const code of ['1','100','200','1Y_3\n','1Y_3\r','1Y_3 ','1!!!!!!!!!!!!!!!!!!','1zzzzzzzzzzzzzzzzz',null,100])assert.throws(()=>decode(code));
 for(const path of ['/1','/100','/200','/1Y_3%0A','/%3Cscript%3E','/1zzzzzzzzzzzzzzzzz','/constructor'])assert.equal(get(path).status,404,path);
 for(const input of ['https://evil.test/1Y_3','javascript:alert(1)','1Y_3%0a'])assert.equal(get('/lookup?code='+encodeURIComponent(input)).status,400);
 assert.equal(get('/lookup?code=https%3A%2F%2Faiused.org%2F1Y_3').headers.get('Location'),'/1/Y_3');
 assert.equal(get('/lookup?code=1%2FY_3').headers.get('Location'),'/1/Y_3');
 assert.equal(get('/?code=1/Y_3/extra').status,400);
});
test('empty and contradictory sets visibly distinguish their meaning',async()=>{
 assert.match(await get('/1/0').text(),/does not mean that no AI was used/);
 const code=encode([27,89,95,99]).slice(1),data=await get('/1/'+code+'.json').json();assert.equal(data.warnings.length,2);
 const html=await get('/1/'+code).text();assert.match(html,/Conflicting declarations/);assert.match(html,/id="copy-link" disabled/);
});
test('QR route validates options and returns downloadable vector with quiet zone',async()=>{
 const r=get('/qr/1/Y_3.svg?mm=10&download=1');assert.equal(r.status,200);
 assert.equal(r.headers.get('X-QR-Modules'),'33');assert.match(r.headers.get('Content-Disposition'),/10mm.svg/);
 assert.match(await r.text(),/width="10mm"/);
 for(const query of ['mm=0','mm=41','mm=NaN','mm=Infinity','mm=','ecc=H'])assert.equal(get('/qr/1/Y_3.svg?'+query).status,400);
});
test('routes, browser assets, HEAD, and method restrictions',async()=>{
 for(const path of ['/','/?code=1/Y_3','/explore','/about','/v1','/v1/categories.json','/blog/why-ai-used','/health','/assets/app.mjs?v=2','/assets/explore.mjs?v=1','/assets/site.css?v=4','/assets/codec.mjs?v=2','/robots.txt','/sitemap.xml','/favicon.svg'])assert.equal(get(path).status,200,path);
 assert.match(await get('/?code=1/Y_3').text(),/value="27" checked/);
 assert.equal(get('/?code=oops').status,400);
 assert.equal(await get('/1/Y_3','HEAD').text(),'');
 assert.equal(get('/','POST').status,405);
});
test('explorer renders the published vocabulary and computation without JavaScript',async()=>{
 const html=await get('/explore').text();
 assert.match(html,/Vocabulary version 1/);
 assert.match(html,/Smaller-set offset/);
 assert.match(html,/Combination rank/);
 assert.match(html,/value="27"/);
 assert.match(html,/src="\/assets\/explore\.mjs\?v=1"/);
});
test('blog explains versioned codes and contribution route without script execution',async()=>{
 const response=get('/blog/why-ai-used'),html=await response.text();
 assert.equal(response.status,200);
 assert.match(html,/The first path segment is the vocabulary version/);
 assert.match(html,/github.com\/ashrocket\/aiused\/blob\/main\/CONTRIBUTING.md/);
 assert.match(html,/rel="canonical" href="https:\/\/aiused.org\/blog\/why-ai-used"/);
 assert.match(await get('/sitemap.xml').text(),/\/blog\/why-ai-used/);
});
