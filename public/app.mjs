import { encode, decode, decodeVersioned, warnings } from '/assets/codec.mjs?v=2';
const $=selector=>document.querySelector(selector);
const checks=[...document.querySelectorAll('input[name="category"]')];
const isBuilder=checks.length>0;
let selected=isBuilder?checks.filter(c=>c.checked).map(c=>Number(c.value)):(location.pathname.startsWith('/1/')?decodeVersioned('1',$('.citation-page').dataset.code):decode($('.citation-page').dataset.code));
let currentCode=encode(selected).slice(1),fullCitation=$('#citation-text')?.value||'',qrTimer;
const toast=message=>{$('#toast').textContent=message;};
function setLink(el,href,enabled){if(!el)return;if(enabled){el.href=href;el.removeAttribute('aria-disabled');}else{el.removeAttribute('href');el.setAttribute('aria-disabled','true');}}
function updateQr(enabled,delayed=false){
 clearTimeout(qrTimer);
 const image=$('#qr-image'),size=Number($('#qr-size').value);
 image.hidden=true;$('#qr-empty').hidden=false;
 setLink($('#qr-download'),`/qr/1/${currentCode}.svg?mm=${size}&download=1`,enabled);
 $('#qr-download').setAttribute('download',`aiused-${currentCode}.svg`);
 $('#qr-note').textContent=`${size} mm ${size===10?'is very small; use a larger size if scans are unreliable.':'is a starting point.'} Test your final printed size with a phone; paper, ink and camera matter. Keep the white border.`;
 if(!enabled){image.removeAttribute('src');return;}
 const code=currentCode;
 qrTimer=setTimeout(()=>{
  image.onload=()=>{if(code===currentCode){image.hidden=false;$('#qr-empty').hidden=true;}};
  image.onerror=()=>{toast('The QR could not load. Try downloading it again.');};
  image.src=`/qr/1/${code}.svg?mm=${size}`;
 },delayed?180:0);
}
function update(){
 selected=checks.filter(c=>c.checked).map(c=>Number(c.value));currentCode=encode(selected).slice(1);
 const problems=warnings(selected),enabled=selected.length>0&&!problems.length;
 $('#code').textContent=currentCode;$('#selection-count').textContent=selected.length?`${selected.length} ${selected.length===1?'declaration':'declarations'} selected`:'Choose declarations to create your citation.';
 $('#empty-note').hidden=selected.length>0;
 const list=$('#selected-list');list.replaceChildren();const descriptions=[];
 for(const check of checks.filter(c=>c.checked)){
  const row=check.closest('.option'),label=row.querySelector('strong').textContent;
  descriptions.push(row.querySelector('.option-copy > span').textContent);
  const li=document.createElement('li'),remove=document.createElement('button');
  remove.type='button';remove.textContent=`${check.value.padStart(2,'0')} · ${label} ×`;remove.setAttribute('aria-label',`Remove ${label}`);
  remove.addEventListener('click',()=>{check.checked=false;update();});li.append(remove);list.append(li);
 }
 fullCitation=`AI use disclosure: ${descriptions.join(' ')||'No declarations supplied.'} (AI Used, vocabulary v1, code 1/${currentCode}). https://aiused.org/1/${currentCode}`;
 $('#conflicts').hidden=!problems.length;$('#conflicts').textContent=problems.join(' ');
 for(const id of ['#copy-link','#copy-citation','#copy-markdown'])$(id).disabled=!enabled;
 setLink($('#view-citation'),`/1/${currentCode}`,enabled);updateQr(enabled,true);
 const url=new URL(location.href);selected.length?url.searchParams.set('code',`1/${currentCode}`):url.searchParams.delete('code');history.replaceState(null,'',url);
}
async function copy(text){
 try{await navigator.clipboard.writeText(text);toast('Copied. Ready to add to your work.');}
 catch{const area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','Copy this text');document.body.append(area);area.select();const copied=document.execCommand('copy');if(copied)area.remove();toast(copied?'Copied.':'Copy the selected text manually.');}
}
$('#copy-link')?.addEventListener('click',()=>copy(`https://aiused.org/1/${currentCode}`));
$('#copy-citation')?.addEventListener('click',()=>copy(fullCitation));
$('#copy-markdown')?.addEventListener('click',()=>copy(`[AI use disclosure: 1/${currentCode}](https://aiused.org/1/${currentCode})`));
$('#qr-size')?.addEventListener('change',()=>updateQr(selected.length>0&&!warnings(selected).length));
if(isBuilder){
 checks.forEach(c=>c.addEventListener('change',update));
 $('#clear').addEventListener('click',()=>{checks.forEach(c=>c.checked=false);update();});
 document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{const ids=button.dataset.preset.split(',').map(Number);checks.forEach(c=>c.checked=ids.includes(Number(c.value)));update();}));
 $('#search').addEventListener('input',()=>{
  const term=$('#search').value.toLowerCase().trim();let count=0;
  document.querySelectorAll('.group').forEach(group=>{let matches=0;group.querySelectorAll('.option').forEach(row=>{row.hidden=!!term&&!row.dataset.search.includes(term);if(!row.hidden)matches++;});group.hidden=matches===0;if(term)group.open=true;group.querySelector('.group-count').textContent=String(matches);count+=matches;});
  $('#search-count').textContent=term?`${count} matching declarations`:'99 declarations in 9 groups';$('#no-results').hidden=count>0;
 });update();
}
