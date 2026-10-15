import test from 'node:test';
import assert from 'node:assert/strict';
test('latest selector excludes old versions and resolves date ties consistently',async()=>{
 const {selectLatestCompatible}=await import('../lib/contextStorage.js');
 const rows=[
  {id:'a',context:'general',questionnaireVersion:'context-v1.0',createdAt:'2026-10-14T01:00:00Z'},
  {id:'b',context:'general',questionnaireVersion:'context-v1.0',createdAt:'2026-10-14T01:00:00Z'},
  {id:'old',context:'general',questionnaireVersion:'v0.1',createdAt:'2026-10-15T01:00:00Z'},
 ];
 assert.equal(selectLatestCompatible(rows,'general','context-v1.0').id,'b');
 assert.equal(selectLatestCompatible([],'general','context-v1.0'),null);
 assert.equal(selectLatestCompatible(rows,'work','context-v1.0'),null);
 assert.equal(rows[0].id,'a');
});
