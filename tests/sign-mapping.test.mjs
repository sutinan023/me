import assert from "node:assert/strict";
import { getSignParts, getSignAsset, SIGN_TYPES } from "../data/personalSigns.js";
import { getSignRegions } from "../data/signExplodedLayouts.js";

for (const type of SIGN_TYPES) {
  const parts = getSignParts(type);
  assert.equal(parts.length, 4);
  parts.forEach((part, i) => {
    assert.equal(part.letter, type[i]);
    assert.ok(part.componentName, `${type}/${part.letter}: missing approved component name`);
    assert.ok(part.visualMeaning, `${type}/${part.letter}: missing visual explanation`);
    assert.ok(getSignRegions(type).some(r => r.part === i), `${type}/${part.letter}: missing highlighted component`);
  });
}

function group(type, id, part) {
  const regions = getSignRegions(type).filter(r => r.id === id);
  assert.ok(regions.length, `${type}: missing physical component ${id}`);
  assert.ok(regions.every(r => r.part === part), `${type}/${id}: wrong dimension`);
}

// Guard the semantic mistakes reported by the user, not just different pixels.
for (const color of ["green", "blue", "purple"]) group("ESTP", `fan-${color}`, 3);
group("ESTP", "foliage", 0);
group("ESTP", "support", 1);
group("ESTP", "hub", 2);
group("INTP", "nodes", 2);
group("INTP", "foliage", 0);
group("ENFP", "warm-core", 2);
group("ENFJ", "foliage", 0);
group("ENFJ", "oval-frame", 3);
assert.match(getSignParts("ESTP")[3].componentName, /ทั้งสาม/);
assert.match(getSignParts("INTP")[2].componentName, /ทั้งสี่/);
assert.match(getSignAsset("ENFP"), /mapped/);
assert.match(getSignAsset("ENFP", true), /mapped/);
assert.match(getSignAsset("ENFJ", true), /mapped/);
assert.equal(getSignAsset("ISFJ"), "/signs/isfj-transparent.png");
assert.deepEqual(getSignParts("invalid"), []);
assert.deepEqual(getSignRegions("invalid"), []);
console.log("Approved mappings: 16 types; ESTP, INTP, ENFP and ENFJ semantic guards PASS");
