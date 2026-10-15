import assert from "node:assert/strict";
import sharp from "sharp";
import { getSignMask, getSignRegions } from "../data/signExplodedLayouts.js";

const rect = (l,t,r,b) => [[l,t],[r,t],[r,b],[l,b]];
async function alpha(region, probes) {
  const css = getSignMask(region);
  const svg = decodeURIComponent(css.slice('url("data:image/svg+xml,'.length, -2));
  const {data,info} = await sharp(Buffer.from(svg)).resize(500,500).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  return probes.map(([x,y]) => data[(Math.floor(y*info.height)*info.width+Math.floor(x*info.width))*4+3]);
}

const outer = rect(0,0,1,1);
// A hole outside an excluded contour must not erase the owner's mask.
assert.deepEqual(await alpha({points:outer,exclude:[{
  points:rect(.4,.4,.6,.6),holes:[rect(.2,.45,.8,.55)],
}]},[[.3,.5],[.5,.425],[.5,.5]]),[255,0,255]);
// The union of overlapping holes remains transparent in the exclusion.
assert.deepEqual(await alpha({points:outer,exclude:[{
  points:rect(.2,.2,.8,.8),holes:[rect(.3,.3,.6,.6),rect(.4,.4,.7,.7)],
}]},[[.5,.5],[.25,.25],[.35,.35]]),[255,0,255]);

const blade = getSignRegions("ESTP").find(r=>r.id==="fan-green");
assert.deepEqual(await alpha(blade,[[.55,.22],[.49,.36],[.45,.46]]),[255,255,255]);
console.log("SVG mask subtraction: external holes, overlapping holes and complete ESTP blade PASS");
