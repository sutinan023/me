import assert from 'node:assert/strict';
import sharp from 'sharp';
import {getSignRegions,getSignMask} from '../data/signExplodedLayouts.js';
const regions=getSignRegions('INFP');
async function alpha(part,points){const masks=await Promise.all(regions.filter(r=>r.part===part).map(async r=>({input:await sharp(Buffer.from(decodeURIComponent(getSignMask(r).slice('url("data:image/svg+xml,'.length,-2)))).resize(1000,1000).png().toBuffer()})));const data=await sharp({create:{width:1000,height:1000,channels:4,background:'#00000000'}}).composite(masks).raw().toBuffer();return points.map(([x,y])=>data[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3])}
const leaves=[[.456,.551],[.44,.70],[.545,.697],[.348,.515],[.406,.518],[.366,.581]];
const source=await sharp('public/signs/infp-exploded-v2.png').resize(1000,1000).ensureAlpha().raw().toBuffer();
for(const [x,y]of leaves)assert.ok(source[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3]>200,'leaf probe must be on opaque source artwork');
assert.deepEqual(await alpha(0,leaves),leaves.map(()=>255),'I highlights whole botanical leaves');
assert.deepEqual(await alpha(2,leaves),leaves.map(()=>0),'F must not claim leaf tips');
assert.deepEqual(await alpha(1,[[.515,.615],[.515,.766]]),[255,255],'N owns the full central stem');
assert.deepEqual(await alpha(2,[[.515,.513],[.53,.273],[.36,.372],[.685,.391]]),[255,255,255,255],'F retains flower core and three petals');
assert.deepEqual(await alpha(3,[[.16,.64],[.874,.654],[.497,.885]]),[255,255,255],'P retains side shells and bottom rim');
console.log('INFP: complete leaves, independent flower/core, stem and open shells PASS');
