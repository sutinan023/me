"use client";

import { useEffect, useMemo, useState } from "react";
import { getLatestResult } from "@/lib/storage";
import SignPreview from "@/components/signs/SignPreview";
import { decodeLocalShare, isValidResult } from "@/lib/share";

const DIMENSIONS = ["EI", "SN", "TF", "JP"];

const DIMENSION_META = {
  EI: {
    left: "E",
    right: "I",
    title: "พลังงานและการประมวลผล",
  },
  SN: {
    left: "S",
    right: "N",
    title: "วิธีรับข้อมูล",
  },
  TF: {
    left: "T",
    right: "F",
    title: "วิธีตัดสินใจ",
  },
  JP: {
    left: "J",
    right: "P",
    title: "การจัดการแผน",
  },
};

function computedType(d) {
  return (
    (d.EI < 50 ? "E" : "I") +
    (d.SN < 50 ? "S" : "N") +
    (d.TF < 50 ? "T" : "F") +
    (d.JP < 50 ? "J" : "P")
  );
}

function distanceLabel(n) {
  if (n <= 10) return "ใกล้กันมาก";
  if (n <= 25) return "ต่างเล็กน้อย";
  if (n <= 45) return "ต่างพอสมควร";
  return "ต่างกันชัด";
}

function readableScores(dims) {
  return {
    EI: `E ${100 - dims.EI} / I ${dims.EI}`,
    SN: `S ${100 - dims.SN} / N ${dims.SN}`,
    TF: `T ${100 - dims.TF} / F ${dims.TF}`,
    JP: `J ${100 - dims.JP} / P ${dims.JP}`,
  };
}

function getTokenFromInput(value) {
  const input = value.trim();

  if (!input) return null;

  try {
    const url = new URL(input);
    const friend = url.searchParams.get("friend");
    const local = url.searchParams.get("p");

    if (friend) return { mode: "database", token: friend };
    if (local) return { mode: "local", token: local };
  } catch {}

  try {
    const query = input.startsWith("?") ? input.slice(1) : input;
    const params = new URLSearchParams(query);

    const friend = params.get("friend");
    const local = params.get("p");

    if (friend) return { mode: "database", token: friend };
    if (local) return { mode: "local", token: local };
  } catch {}

  if (/^[A-Za-z0-9_-]{6,200}$/.test(input)) {
    return { mode: "database", token: input };
  }

  return null;
}

function communicationInsight(me, other) {
  const ei = Math.abs(me.EI - other.EI);
  const sn = Math.abs(me.SN - other.SN);

  if (ei >= 30) {
    return "จังหวะการคุยอาจต่างกันชัด คนหนึ่งอาจคิดผ่านการพูด แต่อีกคนต้องการเวลาประมวลผลก่อน ควรเปิดพื้นที่ให้ตอบคนละจังหวะ";
  }

  if (sn >= 30) {
    return "อาจพูดเรื่องเดียวกันแต่โฟกัสคนละระดับ ลองสื่อสารทั้ง “รายละเอียดที่ต้องทำ” และ “ภาพรวมว่าทำไปเพื่ออะไร”";
  }

  return "รูปแบบการรับและประมวลข้อมูลค่อนข้างใกล้กัน การสื่อสารน่าจะเริ่มต้นได้ง่าย แต่ยังควรเช็กความเข้าใจแทนการเดาใจ";
}

function workInsight(me, other) {
  const jp = Math.abs(me.JP - other.JP);
  const sn = Math.abs(me.SN - other.SN);

  if (jp >= 30) {
    return "เรื่อง deadline และวิธีวางแผนอาจเป็นจุดชน ควรตกลงให้ชัดว่าอะไร “ต้องล็อก” และอะไร “เปลี่ยนได้” ตั้งแต่ต้น";
  }

  if (sn >= 25) {
    return "ความต่างด้านรายละเอียดกับภาพรวมอาจเป็นข้อดี แบ่งบทบาทให้ชัดว่าใครดู execution และใครช่วยมองทางเลือกหรือภาพใหญ่";
  }

  return "จังหวะรับข้อมูลและวางแผนค่อนข้างเข้ากันได้ เหมาะกับการกำหนดเป้าหมายร่วมแล้วแบ่ง ownership ให้ชัด";
}

function conflictInsight(me, other) {
  const tf = Math.abs(me.TF - other.TF);
  const ei = Math.abs(me.EI - other.EI);
  const jp = Math.abs(me.JP - other.JP);

  if (tf >= 25) {
    return "เวลาไม่เห็นด้วย คนหนึ่งอาจเน้นเหตุผล/หลักเกณฑ์ ขณะที่อีกคนเน้นคุณค่าและผลกระทบต่อคน ลองพูดให้ครบทั้ง “ข้อเท็จจริง” และ “ความรู้สึก/ผลกระทบ”";
  }

  if (ei >= 35) {
    return "อย่าบังคับให้เคลียร์ conflict ในจังหวะเดียวกัน คนที่ต้องคิดควรมีเวลาพัก แต่ควรกำหนดด้วยว่าจะกลับมาคุยกันเมื่อไร";
  }

  if (jp >= 30) {
    return "ความต่างเรื่องความชัดเจนกับความยืดหยุ่นอาจทำให้คนหนึ่งรู้สึกว่าอีกฝ่ายเร่งเกินไป หรืออีกคนรู้สึกว่าไม่ตัดสินใจเสียที ควรตกลง deadline ของการตัดสินใจร่วมกัน";
  }

  return "แนวทางตัดสินใจไม่ห่างกันมาก จุดสำคัญคือพูดสิ่งที่ต้องการให้ตรง แทนการคาดว่าอีกฝ่ายน่าจะเข้าใจเอง";
}

function strongestDifference(me, other) {
  return DIMENSIONS.map((key) => ({
    key,
    diff: Math.abs(me[key] - other[key]),
  })).sort((a, b) => b.diff - a.diff)[0];
}

export default function ComparePage() {
  const [me, setMe] = useState(null);

  const [other, setOther] = useState({
    type: "",
    dims: {
      EI: 50,
      SN: 50,
      TF: 50,
      JP: 50,
    },
  });

  const [friendName, setFriendName] = useState("");
  const [shareInput, setShareInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadingFriend, setLoadingFriend] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    setMe(getLatestResult());

    const sp = new URLSearchParams(window.location.search);

    const token = sp.get("friend");
    const local = sp.get("p");

    if (token) {
      loadDatabaseShare(token);
    } else if (local) {
      loadLocalShare(local);
    }
  }, []);

  async function loadDatabaseShare(token) {
    setLoaded(false);
    setLoadingFriend(true);
    setImportError("");
    setImportMessage("");

    try {
      const response = await fetch(`/api/share/${encodeURIComponent(token)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ไม่พบผลที่แชร์");
      }

      if (!isValidResult(data?.result)) {
        throw new Error("ข้อมูลผลลัพธ์ไม่สมบูรณ์");
      }

      setOther(data.result);
      setLoaded(true);
      setImportMessage(
        `นำเข้าผล ${data.result.type || computedType(data.result.dims)} สำเร็จแล้ว`,
      );

      return true;
    } catch (error) {
      setLoaded(false);
      setImportError(error.message || "ไม่สามารถนำเข้าผลได้");
      return false;
    } finally {
      setLoadingFriend(false);
    }
  }

  function loadLocalShare(token) {
    setLoaded(false);
    setImportError("");
    setImportMessage("");

    const decoded = decodeLocalShare(token);

    if (!decoded) {
      setLoaded(false);
      setImportError("ลิงก์หรือรหัสนี้ไม่ถูกต้อง");
      return false;
    }

    setOther(decoded);
    setLoaded(true);
    setImportMessage(
      `นำเข้าผล ${decoded.type || computedType(decoded.dims)} สำเร็จแล้ว`,
    );

    return true;
  }

  async function importFriendResult(value = shareInput) {
    const parsed = getTokenFromInput(value);

    setImportError("");
    setImportMessage("");

    if (!parsed) {
      setLoaded(false);
      setImportError("กรุณาวาง Share Link หรือ Friend Code ที่ถูกต้อง");
      return;
    }

    let ok = false;

    if (parsed.mode === "local") {
      ok = loadLocalShare(parsed.token);
    } else {
      ok = await loadDatabaseShare(parsed.token);
    }

    if (ok) {
      const nextUrl =
        parsed.mode === "database"
          ? `/compare?friend=${encodeURIComponent(parsed.token)}`
          : `/compare?p=${encodeURIComponent(parsed.token)}`;

      window.history.replaceState({}, "", nextUrl);
    }
  }

  async function pasteFromClipboard() {
    setImportError("");

    try {
      const text = await navigator.clipboard.readText();

      if (!text) {
        setImportError("Clipboard ยังไม่มีข้อความ");
        return;
      }

      setShareInput(text);
      await importFriendResult(text);
    } catch {
      setImportError(
        "Browser ไม่อนุญาตให้อ่าน Clipboard กรุณากด Ctrl+V หรือวางลิงก์ด้วยตัวเอง",
      );
    }
  }

  function clearFriend() {
    setOther({
      type: "",
      dims: { EI: 50, SN: 50, TF: 50, JP: 50 },
    });

    setFriendName("");
    setLoaded(false);
    setShareInput("");
    setImportMessage("");
    setImportError("");
    setShareMessage("");

    window.history.replaceState({}, "", "/compare");
  }

  async function shareComparison() {
    if (!loaded || loadingFriend) return;
    setShareMessage("");

    const url = window.location.href;

    const text = friendName
      ? `ดูผล Compare ของฉันกับ ${friendName}`
      : "ดูผล Personality Compare ของฉัน";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Personality Compare",
          text,
          url,
        });

        setShareMessage("แชร์เรียบร้อยแล้ว");
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("คัดลอกลิงก์ Compare แล้ว");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setShareMessage(
          "ไม่สามารถแชร์อัตโนมัติได้ ลอง Copy URL จาก browser แทน",
        );
      }
    }
  }

  const analysis = useMemo(() => {
    if (!me || !loaded || loadingFriend) return null;

    const strongest = strongestDifference(me.dims, other.dims);

    const similarities = DIMENSIONS.map((key) => ({
      key,
      diff: Math.abs(me.dims[key] - other.dims[key]),
    })).filter((item) => item.diff <= 20);

    const differences = DIMENSIONS.map((key) => ({
      key,
      diff: Math.abs(me.dims[key] - other.dims[key]),
    })).filter((item) => item.diff >= 30);

    return {
      strongest,
      similarities,
      differences,
      communication: communicationInsight(me.dims, other.dims),
      work: workInsight(me.dims, other.dims),
      conflict: conflictInsight(me.dims, other.dims),
    };
  }, [me, other, loaded, loadingFriend]);

  if (!me) {
    return (
      <main className="wrap">
        <section className="card" style={{ textAlign: "center" }}>
          <span className="pill">COMPARE</span>

          <h1 className="section-title" style={{ marginTop: 14 }}>
            ก่อน Compare ต้องมีผลของคุณก่อน
          </h1>

          <p className="muted" style={{ maxWidth: 620, margin: "0 auto 20px" }}>
            ระบบต้องใช้คะแนน 4 dimensions ของคุณมาเทียบกับอีกคน
            ถ้ายังไม่เคยทำแบบประเมินบน browser นี้ ให้เริ่มทำก่อนนะ
          </p>

          <button
            className="btn btn-primary"
            onClick={() => {
              window.location.href = "/assessment";
            }}
          >
            เริ่มทำแบบประเมิน →
          </button>
        </section>
      </main>
    );
  }

  const myScores = readableScores(me.dims);
  const otherScores = readableScores(other.dims);
  const otherType = other.type || computedType(other.dims);
  const displayFriend = friendName || "อีกคน";

  return (
    <main className="wrap">
      <section className="card">
        <h1 className="section-title">Compare me with someone</h1>

        <p className="muted">
          เราไม่ใช้ compatibility score แต่ดูว่าความต้องการและจังหวะในแต่ละ
          dimension ต่างกันตรงไหน เพื่อช่วยให้เข้าใจกันง่ายขึ้น
        </p>

        {/* IMPORT */}
        <div
          className="info friend-import"
          style={{ marginTop: 18, padding: 18 }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 6 }}>นำเข้าผลของอีกคน</h3>

          <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
            วาง Share Link ที่เพื่อนส่งมา หรือใส่ Friend Code อย่างเดียวก็ได้
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto auto",
              gap: 8,
              marginTop: 12,
            }}
          >
            <input
              value={shareInput}
              onChange={(e) => setShareInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") importFriendResult();
              }}
              placeholder="วางลิงก์ เช่น https://.../compare?friend=PUrLYbwRgnoP"
              style={{
                width: "100%",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "11px 12px",
                font: "inherit",
                background: "white",
              }}
            />

            <button
              className="btn btn-primary"
              onClick={() => importFriendResult()}
              disabled={loadingFriend}
            >
              {loadingFriend ? "กำลังโหลด…" : "นำเข้าผล"}
            </button>

            <button
              className="btn btn-soft"
              onClick={pasteFromClipboard}
              disabled={loadingFriend}
            >
              Paste
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 6,
                color: "var(--muted)",
              }}
            >
              ชื่อเล่นของอีกคน (ไม่จำเป็น)
            </label>

            <input
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="เช่น Pond, เพื่อน A, แฟน"
              style={{
                width: "100%",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "11px 12px",
                font: "inherit",
                background: "white",
              }}
            />
          </div>

          <p
            className="muted"
            style={{
              fontSize: 12,
              marginBottom: 0,
              marginTop: 10,
            }}
          >
            รองรับ Full URL, <code>?friend=...</code> และ Friend Code อย่างเดียว
          </p>

          {importMessage && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#eef6ef",
                border: "1px solid #d5e7d7",
                fontSize: 13,
              }}
            >
              ✓ {importMessage}
            </div>
          )}

          {importError && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "#fff4f1",
                border: "1px solid #f0d5cc",
                fontSize: 13,
              }}
            >
              {importError}
            </div>
          )}
        </div>

        {/* PEOPLE */}
        <div className="grid2" style={{ marginTop: 16 }}>
          <div className="info">
            <span className="pill">YOU</span>
            <SignPreview type={me.type} />

            <h2 style={{ fontSize: 34, marginBottom: 6 }}>{me.type}</h2>

            <p className="muted" style={{ lineHeight: 1.8 }}>
              {myScores.EI}
              <br />
              {myScores.SN}
              <br />
              {myScores.TF}
              <br />
              {myScores.JP}
            </p>
          </div>

          <div className="info">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span className="pill">
                {friendName ? friendName.toUpperCase() : "OTHER"}
              </span>

              {loaded && (
                <button
                  className="btn btn-soft"
                  style={{ padding: "7px 10px", fontSize: 12 }}
                  onClick={clearFriend}
                >
                  เปลี่ยนคน
                </button>
              )}
            </div>

            {loaded && !loadingFriend ? <>
            <SignPreview type={otherType} />
            <h2 style={{ fontSize: 34, marginBottom: 6 }}>{otherType}</h2>

            <p className="muted" style={{ lineHeight: 1.8 }}>
              {otherScores.EI}
              <br />
              {otherScores.SN}
              <br />
              {otherScores.TF}
              <br />
              {otherScores.JP}
            </p>

            {DIMENSIONS.map((key) => (
              <div key={key} style={{ marginTop: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <label style={{ fontSize: 12, fontWeight: 800 }}>{key}</label>

                  <span className="muted" style={{ fontSize: 11 }}>
                    {otherScores[key]}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={other.dims[key]}
                  onChange={(e) =>
                    setOther((current) => ({
                      ...current,
                      type: "",
                      dims: {
                        ...current.dims,
                        [key]: Number(e.target.value),
                      },
                    }))
                  }
                  style={{ width: "100%" }}
                />
              </div>
            ))}
            </> : <p className="muted" role="status">{loadingFriend ? 'กำลังโหลดผลของอีกคน…' : 'นำเข้าผลของอีกคนเพื่อเริ่มเปรียบเทียบ'}</p>}
          </div>
        </div>

        {/* BIGGEST DIFFERENCE */}
        {analysis && (
          <div
            className="info"
            style={{
              marginTop: 18,
              background:
                "linear-gradient(135deg, rgba(246,200,182,.18), rgba(185,203,185,.16))",
            }}
          >
            <span className="pill">KEY DIFFERENCE</span>

            <h2 style={{ marginBottom: 6 }}>
              ต่างกันมากที่สุดที่ {DIMENSION_META[analysis.strongest.key].title}
            </h2>

            <p className="muted" style={{ marginBottom: 0 }}>
              แกน {analysis.strongest.key} ต่างกัน{" "}
              <strong>{analysis.strongest.diff} จุด</strong> — นี่ไม่ใช่ข้อเสีย
              แต่เป็นจุดที่ควรคุยกันให้ชัดว่าคนละคนต้องการอะไร
            </p>
          </div>
        )}

        {/* DIMENSION COMPARISON */}
        {analysis && <div style={{ marginTop: 18 }}>
          {DIMENSIONS.map((key) => {
            const diff = Math.abs(me.dims[key] - other.dims[key]);
            const meta = DIMENSION_META[key];

            return (
              <div className="info" key={key} style={{ marginTop: 10 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>
                      {meta.left} ↔ {meta.right}
                    </strong>
                    <div
                      className="muted"
                      style={{ fontSize: 12, marginTop: 2 }}
                    >
                      {meta.title}
                    </div>
                  </div>

                  <span className="pill">
                    {distanceLabel(diff)} · {diff} จุด
                  </span>
                </div>

                <div className="bar" style={{ marginTop: 14 }}>
                  <div
                    className="pin"
                    style={{ left: `${me.dims[key]}%` }}
                    title="คุณ"
                  />

                  <div
                    className="pin"
                    style={{
                      left: `${other.dims[key]}%`,
                      background: "var(--coral)",
                    }}
                    title={displayFriend}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--muted)",
                  }}
                >
                  <span>{meta.left}</span>
                  <span>● คุณ &nbsp;&nbsp; ● {displayFriend}</span>
                  <span>{meta.right}</span>
                </div>
              </div>
            );
          })}
        </div>}

        {/* INSIGHTS */}
        {analysis && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 12,
                marginTop: 18,
              }}
              className="compare-insight-grid"
            >
              <div className="info">
                <h3>Communication</h3>
                <p className="muted">{analysis.communication}</p>
              </div>

              <div className="info">
                <h3>Working Together</h3>
                <p className="muted">{analysis.work}</p>
              </div>

              <div className="info">
                <h3>Conflict</h3>
                <p className="muted">{analysis.conflict}</p>
              </div>
            </div>

            <div className="grid2" style={{ marginTop: 14 }}>
              <div className="info">
                <h3>จุดที่น่าจะเข้าใจกันง่าย</h3>

                <p className="muted">
                  {analysis.similarities.length
                    ? `${analysis.similarities
                        .map(
                          (x) =>
                            `${DIMENSION_META[x.key].title} (${x.diff} จุด)`,
                        )
                        .join(
                          ", ",
                        )} มีคะแนนค่อนข้างใกล้กัน จึงอาจมีจังหวะหรือความคาดหวังคล้ายกันในเรื่องเหล่านี้`
                    : "ทั้ง 4 แกนมีความต่างพอสมควร ซึ่งไม่ได้แปลว่าเข้ากันไม่ได้ แต่ควรสื่อสารความต้องการของแต่ละคนให้ตรงมากขึ้น"}
                </p>
              </div>

              <div className="info">
                <h3>จุดที่ควรคุยกันให้ชัด</h3>

                <p className="muted">
                  {analysis.differences.length
                    ? `${analysis.differences
                        .map(
                          (x) =>
                            `${DIMENSION_META[x.key].title} (${x.diff} จุด)`,
                        )
                        .join(
                          ", ",
                        )} ต่างกันค่อนข้างชัด ควรมองเป็น “ความต้องการคนละแบบ” มากกว่าตัดสินว่าใครทำถูกกว่า`
                    : "ไม่มีแกนใดต่างกันมากเป็นพิเศษ แต่คนที่คะแนนใกล้กันก็ยังมีประสบการณ์ ค่านิยม และนิสัยต่างกันได้"}
                </p>
              </div>
            </div>
          </>
        )}

        {/* SHARE COMPARISON */}
        {analysis && <div
          className="info"
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 4px" }}>Share comparison</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              แชร์ลิงก์ Compare นี้ต่อได้ โดยลิงก์จะอ้างอิงผลของอีกคนจาก Share
              Token เดิม
            </p>
          </div>

          <button className="btn btn-primary" onClick={shareComparison}>
            แชร์ผล Compare
          </button>

          {shareMessage && (
            <div
              style={{
                width: "100%",
                fontSize: 13,
                color: "var(--muted)",
              }}
            >
              {shareMessage}
            </div>
          )}
        </div>}

        <div
          className="muted"
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px dashed var(--line)",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          การเปรียบเทียบนี้ใช้ระยะห่างของคะแนนแต่ละ dimension เพื่อช่วย
          self-reflection เท่านั้น ไม่ใช่คะแนน compatibility
          และไม่สามารถทำนายคุณภาพของความสัมพันธ์ได้
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 820px) {
          .compare-insight-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .friend-import > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
