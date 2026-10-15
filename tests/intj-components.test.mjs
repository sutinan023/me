import assert from 'node:assert/strict';
import sharp from 'sharp';
import {getSignRegions,getSignMask} from '../data/signExplodedLayouts.js';
const regions=getSignRegions('INTJ');
async function mask(part){const masks=regions.filter(r=>r.part===part).map(r=>Buffer.from(decodeURIComponent(getSignMask(r).slice('url("data:image/svg+xml,'.length,-2))));return sharp({create:{width:1000,height:1000,channels:4,background:'#00000000'}}).composite(await Promise.all(masks.map(async input=>({input:await sharp(input).resize(1000,1000).png().toBuffer()})))).raw().toBuffer()}
const probes=[{part:0,points:[[.391,.735],[.69,.735],[.285,.34]]},{part:1,points:[[.207,.418],[.783,.42],[.416,.318],[.584,.635]]},{part:2,points:[[.393,.368],[.591,.373],[.399,.597],[.603,.602]]}];
const artwork=await sharp('public/signs/intj-exploded-v2.png').resize(1000,1000).ensureAlpha().raw().toBuffer();
for(const {points}of probes)for(const [x,y]of points){assert.ok(artwork[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3]>200,'probe must be on opaque source artwork')}
for(const {part,points}of probes){const data=await mask(part);for(const [x,y]of points){assert.ok(data[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3]>250,`INTJ part ${part}: full component at ${x},${y}`)}}
const n=await mask(1);assert.equal(n[(735*1000+391)*4+3],0,'N must not include the lower peach leaf');
for(const [x,y]of [[.5,.25],[.5,.74]])assert.equal(n[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3],0,'N must not include the vertical needles');
const j=await mask(3);for(const [x,y]of [[.5,.05],[.08,.49],[.92,.49],[.5,.91]])assert.ok(j[(Math.floor(y*1000)*1000+Math.floor(x*1000))*4+3]>250,'retain all four J frame ornaments');
console.log('INTJ complete leaves, orbit pieces, and four small geometric needles PASS');
