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

## ขั้นตอนการ Deploy บน Vercel

### วิธีที่ 1: Deploy ผ่าน GitHub (แนะนำที่สุด - อัปเดตอัตโนมัติ)
1. นำโปรเจกต์นี้ Push ขึ้น GitHub Repository ของคุณ:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Vite + Three.js tarot astrology"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```
2. เข้าสู่ระบบ [vercel.com](https://vercel.com)
3. กด **"Add New..."** -> **"Project"**
4. เลือก Repository ที่เพิ่ง Push ขึ้นไป
5. ในหน้าตั้งค่า Vercel จะตรวจพบว่าเป็น **Vite** โดยอัตโนมัติ:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. กด **Deploy** รอประมาณ 30 วินาที เว็บไซต์จะพร้อมใช้งานทันที

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
