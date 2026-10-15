"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import SignArtwork from "./SignArtwork";
const SignDiscovery = dynamic(() => import("./SignDiscovery"));
export default function SignPreview({ type, compact = false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={`sign-preview ${compact ? "compact" : ""}`}
        onClick={() => setOpen(true)}
        aria-label={`ค้นพบความหมายของ Personal Sign ${type}`}
      >
        <SignArtwork type={type} size={compact ? 64 : 150} />
        {!compact && (
          <span>
            ค้นพบความหมายของสัญลักษณ์ <b>↗</b>
          </span>
        )}
      </button>
      {open && <SignDiscovery type={type} onClose={() => setOpen(false)} />}
    </>
  );
}
