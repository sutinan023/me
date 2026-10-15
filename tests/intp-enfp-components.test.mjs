import assert from 'node:assert/strict';
import sharp from 'sharp';
import {getSignRegions,getSignMask} from '../data/signExplodedLayouts.js';
async function alpha(type,part,points){const layers=await Promise.all(getSignRegions(type).filter(r=>r.part===part).map(async r=>({input:await sharp(Buffer.from(decodeURIComponent(getSignMask(r).slice('url("data:image/svg+xml,'.length,-2)))).resize(1000,1000).png().toBuffer()})));const data=await sharp({create:{width:1000,height:1000,channels:4,background:'#00000000'}}).composite(layers).raw().toBuffer();return points.map(([x,y])=>data[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3])}
assert.deepEqual(await alpha('INTP',2,[[.48,.437],[.853,.81]]),[0,0],'T must not include neighboring botanical pieces');
assert.deepEqual(await alpha('INTP',0,[[.48,.437],[.853,.81]]),[255,255],'I keeps whole leaves near nodes');
assert.deepEqual(await alpha('INTP',3,[[.557,.718],[.554,.783]]),[255,255],'P keeps bead chain and bottom orbit');
assert.deepEqual(await alpha('ENFP',3,[[.817,.214],[.755,.311],[.428,.851],[.467,.897],[.605,.806]]),[255,255,255,255,255],'P keeps whole large peach ribbon and bottom ribbons');
assert.deepEqual(await alpha('ENFP',0,[[.817,.214],[.755,.311]]),[0,0],'E does not claim the large ribbon');
assert.deepEqual(await alpha('ENFP',2,[[.227,.613],[.246,.558]]),[255,0],'F keeps seed without adjacent purple ribbon');
console.log('INTP and ENFP: physical ownership regression probes PASS');
