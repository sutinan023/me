import Image from "next/image";
import { getSignRegions, getSignMask } from "@/data/signExplodedLayouts";
import {
  normalizeSignType,
  getSignAsset,
  SIGN_ILLUSTRATIONS,
} from "@/data/personalSigns";

export default function SignArtwork({
  type,
  size = 140,
  exploded = false,
  activePart = -1,
  priority = false,
}) {
  const valid = normalizeSignType(type);
  if (valid && exploded && activePart >= 0 && activePart < 4) {
    const regions = getSignRegions(valid);
    const masks = regions.map(getSignMask);
    return (
      <div className="sign-layer-art" style={{ width: size, maxWidth: "100%" }}>
        <Image src={getSignAsset(valid, true)} width={800} height={800}
          sizes={`${size}px`} alt={`Personal Sign ${valid} แยกชิ้นส่วน`}
          className="sign-layer-base" style={{ opacity: 0.24 }} />
        {regions.map(({ part }, i) => part === activePart && (
          <Image key={i} src={getSignAsset(valid, true)} width={800} height={800}
            sizes={`${size}px`} alt="" aria-hidden="true" className="sign-layer-piece"
            style={{ maskImage: masks[i], WebkitMaskImage: masks[i], maskSize: "100% 100%", maskRepeat: "no-repeat" }} />
        ))}
      </div>
    );
  }
  if (valid)
    return (
      <Image
        src={getSignAsset(valid, exploded)}
        width={800}
        height={800}
        sizes={`${size}px`}
        alt={
          exploded
            ? `Personal Sign ${valid} แยกชิ้นส่วน`
            : `Personal Sign ${valid} ${SIGN_ILLUSTRATIONS[valid].alt}`
        }
        priority={priority}
        className="sign-image sign-transparent"
        style={{
          width: size,
          height: size,
          maxWidth: "100%",
          objectFit: "contain",
        }}
      />
    );
  return (
    <div
      className={`letter-sign ${valid?.[0] === "E" ? "outward" : ""} ${valid?.[3] === "P" ? "open" : ""}`}
      style={{ width: size, height: size }}
      aria-label={`องค์ประกอบ Personal Sign ${valid || "ไม่ทราบ Type"}`}
    >
      {valid ? (
        [...valid].map((letter, i) => (
          <span key={i} className={letter === "F" ? "organic" : ""}>
            {letter}
          </span>
        ))
      ) : (
        <span>?</span>
      )}
    </div>
  );
}
