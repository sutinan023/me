# Personal Sign · Cozy Discovery update

## อัปเดตแยกองค์ประกอบครบ 16 Type — 12 ตุลาคม 2026

- ทุก Type ใช้ปุ่มประกอบสมบูรณ์/แยกชิ้นส่วนและเลือกไฮไลต์ตาม 4 มิติได้
- ภาพแยกใหม่ของอีก 15 Type อยู่ใน `public/signs/<type>-exploded-v2.png` เป็น PNG โปร่งใสที่สร้างจากภาพต้นฉบับด้วย ImageGen
- แยกชิ้นส่วนตามรอยต่อและแนวประกอบเดิมแบบ ISFJ โดยยังเห็นโครงสร้างของสัญลักษณ์ เช่น กรอบ เข็มทิศ กลีบดอก แกน และฐาน พร้อมเส้นเชื่อมจุดประกอบ; ISFJ คงรูปแบบแยกโคมไฟเดิม
- ขอบเขตสำหรับไฮไลต์อยู่ใน `data/signExplodedLayouts.js` ใช้เส้นรอบชิ้นงานและช่องว่างของกรอบแทนการตัดภาพด้วยสี่เหลี่ยมสำหรับอีก 15 Type และใช้ร่วมกันทั้ง WebGL กับภาพสำรอง
- ISFJ ทั้งภาพปกติและภาพแยกมี alpha transparency จริง; หน้าเว็บอ้างไฟล์ `isfj-transparent.png` และ `isfj-exploded-transparent.png` เพื่อหลีกเลี่ยง cache ของภาพเดิม
- คำสั่งภาพ: ลบเฉพาะพื้นหลังสีครีมของ ISFJ โดยเก็บสีภายในโคมไฟ; แยกชิ้นส่วนของ Type อื่นออกจากจุดประกอบเดิมบนพื้นหลังโปร่งใส โดยคงรูปทรง โทนสี และสไตล์ต้นฉบับ
- Three.js ยังคงเป็นการแสดงภาพ 2.5D; ภาพองค์ประกอบเป็น atlas ของชิ้นส่วน ไม่ใช่โมเดล 3D ของแต่ละชิ้น
- scoring, คำถาม, storage keys, baseline, และ API เดิมคงไว้

ผสานดีไซน์ mockup ที่เลือกเข้ากับ Personality Type Explorer จาก commit `800b9cc45904bf61a9c4bf6645ae8ae993f7563d`.

## ติดตั้งบนโปรเจกต์เดิม

1. แตก ZIP แล้วคัดลอกไฟล์ภายในโฟลเดอร์ `me-personal-sign-update` ลงในโฟลเดอร์ repo `me` เดิม
2. คง `.env.local` และค่า Environment Variables บน Vercel ของคุณไว้ ไม่รวมข้อมูลเหล่านี้ใน ZIP
3. รัน `npm ci` แล้ว `npm run build`
4. ตรวจด้วย `npm run dev` จากนั้น commit และ push ด้วยบัญชี GitHub ของคุณ
5. ถ้า Vercel เชื่อมกับ branch ที่ push อยู่ ให้ตรวจสถานะ deployment ว่าสำเร็จแล้วก่อนเปิดเว็บจริง

## การเปลี่ยนแปลง

- ธีมครีม–เขียวและรูปแบบตัวอักษร/ปุ่ม/การ์ดใช้ร่วมกันทุกหน้า รวม Assessment และ Methodology
- หน้า Home มีตัวอย่าง Personal Sign ISFJ ที่ระบุว่าเป็นตัวอย่าง
- Result, Compare และ History เปิดหน้าค้นพบสัญลักษณ์ได้
- เปิดความหมาย 4 องค์ประกอบตาม Type จริง ข้าม ดูซ้ำ และปิดด้วย Escape ได้
- ภาพต้นฉบับ ISFJ ทั้งสองภาพใช้ Three.js แบบ 2.5D โดยโหลดเมื่อเปิดหน้าค้นพบเท่านั้น
- มีภาพสำรองเมื่อ WebGL ใช้ไม่ได้ รองรับ Reduced Motion และหยุด loop เมื่อแท็บไม่ปรากฏ
- บันทึก PNG card จากผลจริงได้ โดยไม่ต้องเรียก database
- เก็บ localStorage keys, scoring, คำถาม, auto-next และ API เดิม

## ขอบเขตของ artwork

มี illustration ครบทั้ง 16 Type โดยคงภาพ ISFJ ต้นฉบับ และสร้างอีก 15 Type เป็นไฟล์ PNG โปร่งใสแยกราย Type ในสไตล์เดียวกัน ใช้งานจริงใน Result, Compare, History และ PNG card

หน้า `/signs` แสดงแกลเลอรีครบ 16 Type และกดเปิดความหมายได้ทุกภาพ

ทุก Type ใช้ Three.js สลับภาพประกอบสมบูรณ์และภาพแยกชิ้นส่วน พร้อมการลอย/เอียงเบา ๆ และคำอธิบายทีละมิติ ขอบเขตไฮไลต์กำหนดแยกตามชิ้นส่วนของแต่ละ Type และใช้ร่วมกับภาพสำรองเมื่อ WebGL ใช้ไม่ได้

ภาพแยกชิ้นส่วน ISFJ ใช้พื้นที่ของภาพ Preview เป็น texture regions ใน runtime ยังไม่ใช่ไฟล์ layer โปร่งใสแยกแต่ละชิ้น ไม่มีการวาด artwork ใหม่เป็น SVG

## การตรวจสอบ

- Production build ผ่าน รวมหน้าใหม่ `/signs`
- ตรวจไฟล์ภาพใหม่ทั้ง 15 ว่ามี alpha transparency และคง ISFJ เดิม
- ทดสอบแกลเลอรีครบ 16 ภาพ และเปิด Discovery พร้อมภาพถูก Type ทั้ง 16 แบบ
- ทดสอบ download PNG card ครบทั้ง 16 Type
- Playwright + Chromium: 6 routes ที่ viewport 390×844 ไม่มี horizontal overflow
- ตรวจ desktop 1440×1000 และภาพ modal บนมือถือ
- WebGL shader, I → S → F → J, replay, skip, Escape, ประวัติ, Type อื่น และ download PNG ผ่าน
- Reduced Motion ผ่าน และไม่พบ console/page errors ใน flow ที่ทดสอบ
- ไม่ทดสอบการบันทึก/อ่านข้อมูล Supabase หรือสร้าง share token จริง เพราะไม่มี environment ของระบบ production

GitHub connector ตอบ `403 Resource not accessible by integration` ตอนสร้าง branch จึงยังไม่ได้ push, เปิด PR หรือ deploy การแก้ไขนี้

## Approved component mapping v1 — 2026-10-13

Applied the approved 16-type table in PERSONAL_SIGN_MAPPING_REVIEW.md to actual component names, visual meanings and highlight ownership. Complete physical pieces have one primary dimension. ESTP uses all three fan blades for P; INTP uses all four nodes for T. ENFP has a separate warm F core; ENFJ foliage is detached from its J oval rails. ISFJ transparent artwork is preserved.

Artwork paths and exact edit prompts are recorded in data/signMappingArtworkManifest.json. Generated siblings are public/signs/enfp-mapped-v1.png, public/signs/enfp-exploded-mapped-v1.png and public/signs/enfj-exploded-mapped-v1.png.

Verification: production build and both Node suites pass; desktop and fallback cover all 16 types and 64 highlights, plus mobile and Reduced Motion. Final Result/Compare/History Discovery smoke tests and ENFP PNG download pass with no page errors. INFJ path and all three ESTP blades were visually checked in the final fallback. Original assessment, scoring, storage keys and API behavior are retained. No production database writes or deployment performed.

Local test: http://localhost:3001/signs

### INTJ visual review correction — 2026-10-13

User accepted J only. Replaced the coarse I rectangles with leaf/stem contours, included both orbit rings and their nodes/links in N, and traced all four small blue needles plus cardinal needles and the core for T. The original J frame outline is retained. Painted edges are included in their component mask. Added tests/intj-components.test.mjs to check opaque artwork probes, complete small needles, orbit pieces, excluded peach leaves and vertical needles, and the four J frame ornaments. The initial test reproduced the missing lower leaf before correction.
INTJ final verification: production build exits 0; all three Node suites pass; browser checks cover 4 WebGL highlights, 4 fallback highlights, reassembly, Escape, and mobile controls with no page errors.

### INFP visual review correction — 2026-10-13

Replaced the central botanical bounding area with six leaf contours, traced the main stem and branch connectors, and replaced the flower-core rectangle with its actual outline. F no longer highlights the neighboring leaf tip. P retains its existing two open side shells and bottom rim. Added tests/infp-components.test.mjs: original leaf-tip defect reproduced before the fix; opaque source leaf probes, independent F core/petals, full N stem and P samples pass. All four Node suites and production build pass. Browser checks cover all four WebGL and fallback highlights, reassembly, Escape and mobile controls with no page errors; final I/N/F screenshots inspected.

### INTP / ENFP visual review correction — 2026-10-14

INTP: replaced rectangular node bounds with circular contours for all four nodes; retraced botanical clusters, connector assemblies and complete outer orbit paths/bead chains. Orbit holes protect leaves and decorative stars.
ENFP: retraced contours against enfp-exploded-mapped-v1.png, including the previously omitted large peach ribbon and both bottom ribbon pieces. Updated branching stems and seed outline to prevent F from claiming the nearby purple ribbon. Small botanical pieces remain E.
Avoided duplicate orbit subtraction from leaf shaders where matching leaf holes already exist, and discarded holes outside each region's bounding box. This preserves mask ownership while reducing software WebGL compilation work.
Added tests/intp-enfp-components.test.mjs (initial missing-orbit probes failed; updated ownership probes pass). All five Node suites pass; final production build exits 0. Browser QA: each type has four distinct WebGL and four fallback highlights, reassembly and Escape pass, mobile controls pass, no page errors. Final INTP and ENFP screenshots inspected. Test server remains http://localhost:3001/signs.
