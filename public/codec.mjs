const alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
export function choose(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let r=1n;for(let i=1;i<=k;i++)r=r*BigInt(n-i+1)/BigInt(i);return r;}
export function encode(ids){const a=[...new Set(ids)].sort((x,y)=>x-y);if(a.some(i=>!Number.isInteger(i)||i<1||i>99))throw Error('Choose IDs 1–99.');let r=0n;for(let j=0;j<a.length;j++)r+=choose(99,j);a.forEach((x,j)=>r+=choose(x-1,j+1));let s='';do{s=alphabet[Number(r%64n)]+s;r/=64n;}while(r);return '1'+s;}
export function decode(code){if(typeof code!=='string'||code.length<2||code.length>18||!/^1[0-9A-Za-z_-]+$/.test(code)||/[^0-9A-Za-z_-]/.test(code))throw Error('Enter a valid version 1 code.');const p=code.slice(1);if(p.length>1&&p[0]==='0')throw Error('The code has a noncanonical leading zero.');let r=0n;for(const c of p)r=r*64n+BigInt(alphabet.indexOf(c));if(r>=2n**99n)throw Error('The code is outside the version 1 range.');let k=0;while(r>=choose(99,k)){r-=choose(99,k);k++;}const out=[];let upper=98;for(let j=k;j>0;j--){let x=upper;while(choose(x,j)>r)x--;out.push(x+1);r-=choose(x,j);upper=x-1;}return out.sort((a,b)=>a-b);}
export function warnings(ids){const out=[];if(ids.includes(89)&&ids.some(i=>i<=88))out.push('“AI-capable software only” conflicts with the selected known AI actions.');if([95,98,99].filter(i=>ids.includes(i)).length>1)out.push('Choose one review status for the same scope: full, partial, or no human review.');return out;}

// URL version tokens use the same URL-safe base-64 digits as the subset code.
// They are canonical positive integers and can grow from one to four characters.
export function parseVersion(token){
 if(typeof token!=='string'||!/^[0-9A-Za-z_-]{1,4}$/.test(token)||token==='0'||(token.length>1&&token[0]==='0'))throw Error('Invalid vocabulary version.');
 let value=0n;for(const digit of token)value=value*64n+BigInt(alphabet.indexOf(digit));
 return value;
}
export function disclosurePath(ids,version='1'){
 if(parseVersion(version)!==1n)throw Error('This vocabulary version is not supported.');
 return `/${version}/${encode(ids).slice(1)}`;
}
export function decodeVersioned(version,payload){
 if(parseVersion(version)!==1n)throw Error('This vocabulary version is not supported.');
 return decode('1'+payload);
}
