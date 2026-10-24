import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
import { routeFamily } from '../src/analytics.mjs';

test('analytics records only a fixed route family, method, status, and timing',()=>{
  const points=[];
  const env={ANALYTICS:{writeDataPoint:point=>points.push(point)}};
  const request=new Request('https://aiused.org/1/Y_3?private=do-not-collect',{
    headers:{'x-person':'do-not-collect'}
  });
  const response=worker.fetch(request,env);
  assert.equal(response.status,200);
  assert.equal(points.length,1);
  assert.deepEqual(points[0].blobs,['citation','GET','200']);
  assert.equal(points[0].doubles[0],1);
  assert.ok(points[0].doubles[1]>=0);
  assert.doesNotMatch(JSON.stringify(points),/Y_3|do-not-collect/);
  assert.equal(routeFamily('/qr/1/Y_3.svg'),'qr');
  assert.equal(routeFamily('/1/Y_3.json'),'citation_json');
  assert.equal(routeFamily('/something-private'),'other');
});

test('missing or failing analytics bindings never break disclosure delivery',()=>{
  const request=new Request('https://aiused.org/1/Y_3');
  assert.equal(worker.fetch(request).status,200);
  assert.equal(worker.fetch(request,{ANALYTICS:{writeDataPoint(){throw Error('unavailable');}}}).status,200);
});
