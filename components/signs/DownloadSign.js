"use client";
import { useState } from "react";
import { getSignAsset } from "@/data/personalSigns";
export default function DownloadSign({ profile }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function download() {
    setBusy(true);
    setMessage("");
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const c = canvas.getContext("2d");
      if (!c) throw new Error();
      c.fillStyle = "#f8f6f0";
      c.fillRect(0, 0, 1080, 1350);
      c.textAlign = "center";
      c.fillStyle = "#87937c";
      c.font = "24px sans-serif";
      c.fillText("PERSONALITY TYPE EXPLORER", 540, 105);
      const src = getSignAsset(profile.type);
      if (!src) throw new Error("Unknown personal sign");
      const image = new window.Image();
      image.src = src;
      await image.decode();
      c.drawImage(image, 220, 135, 640, 640);
      c.fillStyle = "#29483c";
      c.font = "60px sans-serif";
      c.fillText(profile.type, 540, 840);
      c.font = "25px sans-serif";
      c.fillText(profile.name || "Your Personal Sign", 540, 905);
      c.fillStyle = "#7d8376";
      c.font = "24px sans-serif";
      const d = profile.dims;
      [
        `E ${100 - d.EI} / I ${d.EI}`,
        `S ${100 - d.SN} / N ${d.SN}`,
        `T ${100 - d.TF} / F ${d.TF}`,
        `J ${100 - d.JP} / P ${d.JP}`,
      ].forEach((text, i) => c.fillText(text, 540, 985 + i * 48));
      c.font = "20px sans-serif";
      c.fillText("A symbol to discover, not to define.", 540, 1260);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error();
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `personal-sign-${profile.type.toLowerCase()}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setMessage("บันทึกการ์ด PNG แล้ว");
    } catch {
      setMessage("บันทึกภาพไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="btn btn-soft" onClick={download} disabled={busy}>
        {busy ? "กำลังสร้างภาพ…" : "บันทึกการ์ด PNG"}
      </button>
      <span className="sign-download-message" role="status">
        {message}
      </span>
    </>
  );
}
