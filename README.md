# เรือนพยากรณ์ พ่อหมอ SARABEST (Vite.js + Three.js)

เว็บแอปพลิเคชันพยากรณ์ดวงชะตา 3D แบบครบวงจร:
- **เซียมซี 3D ๔๐ หมายเลข** อิงคำทำนายโบราณร่วมสมัย 40 ใบ พร้อมระบบฟิสิกส์เขย่ากระบอกไม้ไผ่
- **ไพ่ยิปซี ทาโรต์ (Major Arcana)** ระบบ 3D Deck เปิดไพ่ 1 ใบ / 3 ใบ (อดีต-ปัจจุบัน-อนาคต และ งาน-เงิน-รัก)
- **ระบบเสียงบรรยากาศ (Tone.js)** เสียงเขย่าไม้เซียมซีและระฆังทองเหลืองวัดโบราณ

---

## เทคโนโลยีหลัก (Tech Stack)
- **Vite 5** (Fast Build & Bundler)
- **Three.js** (WebGL 3D Scene, Altar Table, Cylinder, 3D Sticks, Tarot Deck & Particle System)
- **Tone.js** (Synthesizer Audio Effects)
- **Tailwind CSS & FontAwesome 6** (Modern Dark Mystic UI)

---

## การรันบนเครื่อง Local (Development)

```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server
npm run dev

# บิลด์สำหรับ Production
npm run build

# ทดสอบรันไฟล์บิลด์
npm run preview
```

---

## ขั้นตอนการ Deploy บน Render (แนะนำสำหรับ Static Site ฟรี 100%)

โปรเจกต์นี้มีไฟล์ `render.yaml` เตรียมไว้แล้ว รองรับทั้งแบบ Blueprint อัตโนมัติ หรือตั้งค่าหน้าเว็บ Render Dashboard:

### วิธีที่ 1: Deploy บน Render ผ่าน Dashboard
1. เข้าสู่ระบบ [render.com](https://render.com) (เข้าด้วย GitHub ได้เลย)
2. กดปุ่ม **"New +"** มุมขวาบน -> เลือก **"Static Site"**
3. ค้นหาและเลือก Repository: `hornets21/pod-tarot-astrology`
4. ตั้งค่าดังนี้:
   - **Name:** `pod-tarot-astrology` (หรือชื่อที่ต้องการ)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. ในส่วน **Advanced** -> **Redirects/Rewrites**:
   - กด **Add Rule**
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. กด **"Create Static Site"** รอระบบ Build ประมาณ 1 นาที จะได้ URL เช่น `https://pod-tarot-astrology.onrender.com` ใช้งานได้ทันที

---

## ขั้นตอนการ Deploy บน Vercel


---

### วิธีที่ 2: Deploy ผ่าน Vercel CLI โดยตรง

```bash
# ติดตั้ง Vercel CLI (ครั้งแรก)
npm install -g vercel

# ล็อกอิน Vercel
vercel login

# Deploy สู่สภาพแวดล้อม Production
vercel --prod
```
