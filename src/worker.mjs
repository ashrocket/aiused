import { decode, decodeVersioned, disclosurePath, parseVersion, warnings } from '../public/codec.mjs';
import { createQr } from './qr.mjs';
import { home, citation, vocabulary, about, shell, declarations, citationText, origin } from './render.mjs';
import { catalogJSON, catalogHash } from './catalog.mjs';
import { assets } from './assets.mjs';
import { postTitle, postBody } from './blog.mjs';

const security={
 'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
 'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Strict-Transport-Security':'max-age=31536000',
};
function respond(body,type='text/html; charset=utf-8',status=200,extra={}){
 return new Response(body,{status,headers:{...security,'Content-Type':type,'Cache-Control':status===200?'public, max-age=300':'no-store',...extra}});
}
const json=data=>respond(JSON.stringify(data,null,2),'application/json; charset=utf-8',200,{'Access-Control-Allow-Origin':'*'});
const errorPage=(status,title,message)=>respond(shell(title,`<main id="main" class="reading"><p class="eyebrow">${status}</p><h1>${title}</h1><p class="intro">${message}</p><a class="button" href="/">Make a disclosure ↗</a></main>`,{noindex:true}),undefined,status);
export function handle(request){
 const url=new URL(request.url),path=url.pathname;
 if(!['GET','HEAD'].includes(request.method))return respond('Method not allowed','text/plain; charset=utf-8',405,{'Allow':'GET, HEAD'});
 if(Object.hasOwn(assets,path))return respond(assets[path].body,assets[path].type);
 if(path==='/health')return json({status:'ok',service:'aiused',release:'v1.0.0',vocabulary_sha256:catalogHash});
 if(path==='/v1/categories.json')return respond(catalogJSON,'application/json; charset=utf-8',200,{'Access-Control-Allow-Origin':'*','ETag':`"${catalogHash}"`,'Cache-Control':'public, max-age=31536000, immutable'});
 if(path==='/v1')return respond(vocabulary());
 if(path==='/about')return respond(about());
 if(path==='/blog/why-ai-used')return respond(shell(postTitle,`<main id="main" class="reading blog-post"><p class="eyebrow">From AI Used · 23 October 2026</p><h1>${postTitle}</h1>${postBody}</main>`,{path,description:'Why we built a short, versioned link for precise AI-use disclosures, and how to contribute.'}));
 if(path==='/robots.txt')return respond('User-agent: *\nAllow: /\nSitemap: https://aiused.org/sitemap.xml\n','text/plain; charset=utf-8');
 if(path==='/sitemap.xml')return respond(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/about','/v1','/blog/why-ai-used'].map(p=>`<url><loc>${origin}${p}</loc></url>`).join('')}</urlset>`,'application/xml; charset=utf-8');
 if(path==='/favicon.svg')return respond('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#173e32"/><path d="M11 28L28 11M13 11h15v15" fill="none" stroke="#d9f99d" stroke-width="4"/></svg>','image/svg+xml');
 if(path==='/lookup'){
  try{
   let code=(url.searchParams.get('code')||'').trim();
   if(code.startsWith('https://aiused.org/'))code=code.slice('https://aiused.org/'.length);
   code=code.replace(/^\//,'').replace(/\/$/,'');
   const parts=code.split('/');
   const ids=parts.length===2?decodeVersioned(parts[0],parts[1]):decode(code);
   return respond(null,'text/plain',303,{'Location':disclosurePath(ids),'Cache-Control':'no-store'});
  }catch{return errorPage(400,'Code not recognized.','Check the characters and capitalization. You can enter a code such as 1Y_3 or its full aiused.org link.');}
 }
 if(path==='/'){
  try{
   const code=url.searchParams.get('code');
   const parts=code?.split('/');
   if(parts && parts.length>2)throw Error('Invalid disclosure path.');
   const ids=parts?.length===2?decodeVersioned(parts[0],parts[1]):code?decode(code):[];
   return respond(home(ids),undefined,200,{'Cache-Control':'no-store'});
  }
  catch{return errorPage(400,'Code not recognized.','The starting code is invalid. Check its capitalization or start a new disclosure.');}
 }
 const legacyQr=/^\/qr\/(1[0-9A-Za-z_-]{1,17})\.svg$/.exec(path);
 if(legacyQr){try{decode(legacyQr[1]);return respond(null,'text/plain',308,{'Location':`/qr/1/${legacyQr[1].slice(1)}.svg${url.search}`});}catch{/* Invalid code. */}}
 const qr=/^\/qr\/([0-9A-Za-z_-]{1,4})\/([0-9A-Za-z_-]{1,17})\.svg$/.exec(path);
 if(qr){
  try{
   const ids=decodeVersioned(qr[1],qr[2]);
   const canonical=disclosurePath(ids);
   const mm=url.searchParams.has('mm')?Number(url.searchParams.get('mm')):12;
   const result=createQr(canonical,{mm,ecc:url.searchParams.get('ecc')||'M'});
   return respond(result.svg,'image/svg+xml; charset=utf-8',200,{
    'Cache-Control':'public, max-age=86400','X-QR-Modules':String(result.totalModules),'X-QR-Minimum-Print-MM':String(result.minimumPrintMm),
    ...(url.searchParams.get('download')==='1'?{'Content-Disposition':`attachment; filename="aiused-${qr[1]}-${qr[2]}-${mm}mm.svg"`}:{}),
   });
  }catch{return respond('Invalid code, size (8–40 mm) or error correction (L/M).','text/plain; charset=utf-8',400);}
 }
 const legacy=/^\/(1[0-9A-Za-z_-]{1,17})(\.json)?$/.exec(path);
 if(legacy){try{decode(legacy[1]);return respond(null,'text/plain',308,{'Location':`/1/${legacy[1].slice(1)}${legacy[2]||''}`});}catch{/* Invalid code. */}}
 const match=/^\/([0-9A-Za-z_-]{1,4})\/([0-9A-Za-z_-]{1,17})(\.json)?\/?$/.exec(path);
 if(match){
  try{
   const ids=decodeVersioned(match[1],match[2]);
   const canonical=disclosurePath(ids);
   if(path.endsWith('/'))return respond(null,'text/plain',308,{'Location':`${canonical}${match[3]||''}`});
   if(match[3])return json({vocabulary_version:match[1],code:match[2],url:`${origin}${canonical}`,category_ids:ids,declarations:declarations(ids),warnings:warnings(ids),citation:citationText(ids),vocabulary_url:`${origin}/v1/categories.json`,vocabulary_sha256:catalogHash,scope:'Creator-supplied declaration; no creator or work identity is encoded. Unselected categories are unclaimed, not absent.'});
   return respond(citation(ids));
  }catch{/* Invalid codes have no implicit or guessed meaning. */}
 }
 return errorPage(404,'No disclosure found.','This path is not a valid version 1 disclosure code. Codes are case-sensitive.');
}
export default{fetch(request){const response=handle(request);return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;}};
