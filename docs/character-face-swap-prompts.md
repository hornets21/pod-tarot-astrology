# คู่มือและเทมเพลต Prompt: เปลี่ยนใบหน้าตัวละครโดยอ้างอิงจากภาพจริง
*(Character Face Replacement & Real-Face Swap Prompt Guide)*

คู่มือนี้รวบรวม Prompt, พารามิเตอร์ และ Workflow สำหรับการสร้างหรือสลับใบหน้าตัวละคร AI ให้เหมือน/คล้ายคนจริงมากที่สุด โดยคงรายละเอียดท่าทาง ชุด และฉากหลังเดิมไว้ รองรับเครื่องมือยอดนิยม เช่น **Midjourney**, **Stable Diffusion (InstantID / IP-Adapter / ReActor)**, **Fooocus**, **Photoshop Generative Fill** และ **Leonardo.Ai / SeaArt**

---

## สารบัญ
1. [เทคนิคสำคัญในการเปลี่ยนเฉพาะใบหน้า (Core Principles)](#1-เทคนิคสำคัญในการเปลี่ยนเฉพาะใบหน้า)
2. [Midjourney v6 (Character Reference `--cref` & Vary Region)](#2-midjourney-v6)
3. [Stable Diffusion & Fooocus (Inpaint + InstantID / FaceID)](#3-stable-diffusion--fooocus)
4. [Prompt Templates แยกตามสไตล์](#4-prompt-templates-แยกตามสไตล์)
   - [4.1 สไตล์พ่อหมอ/แม่หมอพยากรณ์ (Mystic Fortune Teller / Tarot Reader)](#41-สไตล์พ่อหมอแม่หมอพยากรณ์-tarot--mystic)
   - [4.2 สไตล์สมจริงระดับสตูดิโอ (Cinematic / Studio Portrait)](#42-สไตล์สมจริงระดับสตูดิโอ-cinematic-portrait)
   - [4.3 สไตล์แฟนตาซี / ศิลปะยุคกลาง (Fantasy / Royal Vintage)](#43-สไตล์แฟนตาซี--ภาพวาดคลาสสิก-fantasy--vintage)
5. [Inpainting / Mask Prompts (เฉพาะจุด)](#5-inpainting--mask-prompts)
6. [ข้อแนะนำในการเตรียมภาพจริงเพื่อให้ AI เรียนรู้ได้ดีที่สุด](#6-ข้อแนะนำในการเตรียมภาพจริง)

---

## 1. เทคนิคสำคัญในการเปลี่ยนเฉพาะใบหน้า

1. **แยกส่วน "รูปหน้าจริง" กับ "สไตล์ตัวละคร":**
   - AI ที่ใช้รูปภาพอ้างอิง (Image-to-Image / ControlNet) จะรักษาโครงหน้าได้ดีกว่าการบรรยายด้วยข้อความอย่างเดียว
2. **ใช้ Character Weight (น้ำหนักใบหน้า):**
   - หากต้องการเปลี่ยน **เฉพาะหน้า** โดยไม่เอาเสื้อผ้า/ทรงผมจากภาพจริงมา ต้องปรับค่าน้ำหนักให้โฟกัสเฉพาะ Face structure
3. **การ Inpainting (ระบายเฉพาะส่วนหน้า):**
   - วิธีที่เนียนที่สุดคือการเจาะระบายเฉพาะบริเวณเบ้าหน้า (Face Oval) แล้วสั่ง Gen ทับด้วย Prompt ที่อ้างอิงภาพจริง

---

## 2. Midjourney v6

### วิธีที่ 1: ใช้ `--cref` (Character Reference) ร่วมกับ `--cw 0`
> **เคล็ดลับ:** `--cw 0` คือคำสั่งบังคับให้ Midjourney ดึงเฉพาะ **"ใบหน้า"** จากภาพอ้างอิงเท่านั้น โดยไม่ดึงเสื้อผ้าหรือทรงผมมา

**รูปแบบคำสั่ง:**
```text
[URL_ภาพหน้าจริง] [Prompt บรรยายตัวละคร/ฉาก/ชุด] --cref [URL_ภาพหน้าจริง] --cw 0 --v 6.0 --ar 16:9
```

**ตัวอย่าง Prompt:**
```text
https://my-image-url.com/real_face.jpg A charismatic mystical male fortune teller sitting at a dark velvet tarot table, holding glowing tarot cards, mysterious ambient purple and warm candlelight, ornate royal robes, sharp facial features perfectly matching the reference image, high-end photography, 8k resolution, cinematic lighting --cref https://my-image-url.com/real_face.jpg --cw 0 --v 6.0 --ar 3:4 --style raw
```

### วิธีที่ 2: ใช้ Vary (Region) Inpainting
1. Gen ภาพตัวละครหรือฉากที่ต้องการใน Midjourney จนได้ภาพที่ถูกใจ
2. กดปุ่ม **`Vary (Region)`**
3. ใช้เครื่องมือ Brush ระบายเฉพาะส่วนใบหน้าของตัวละคร
4. ใส่ URL ภาพหน้าจริงและ Prompt เฉพาะใบหน้า:
```text
https://my-image-url.com/real_face.jpg identical facial features and exact face structure of the reference man, natural realistic skin texture, photorealistic eyes and expression --cref https://my-image-url.com/real_face.jpg --cw 0 --v 6.0
```

---

## 3. Stable Diffusion & Fooocus

### ในโปรแกรม Fooocus (ง่ายที่สุด):
1. ติ๊กเลือก **Input Image** -> **Image Prompt**
2. เลือกโหมด **CPDS** หรือ **FaceSwap**
3. ใส่ภาพถ่ายจริงของบุคคลที่ต้องการ
4. ปรับค่า `Image Weight: 0.85 - 0.95` และ `Stop At: 0.9`

### ใน Stable Diffusion WebUI / ComfyUI:
- **InstantID / IP-Adapter FaceID Plus v2:** รักษาอัตลักษณ์และรูปทรงกะโหลก/โครงหน้าได้แม่นยำที่สุด
- **ReActor Extension (Roop/InsightFace):** สลับหน้า 1:1 ได้ทันทีหลัง Gen ภาพเสร็จ

---

## 4. Prompt Templates แยกตามสไตล์

### 4.1 สไตล์พ่อหมอ/แม่หมอพยากรณ์ (Tarot & Mystic)
*(เหมาะสำหรับโปรเจกต์ไพ่ยิปซี, โหราศาสตร์ หรือเซียมซี)*

#### Positive Prompt:
```text
Cinematic portrait of a mystical Thai tarot master, featuring the exact facial features and identity of [Reference Image], striking realistic eyes, serene and wise expression, wearing an intricate embroidered dark violet and gold velvet robe. Sitting in front of a rustic wooden divination altar with glowing candles, crystal ball, and spread tarot cards. Ethereal atmospheric haze, volumetric lighting, photorealistic, 8k octane render, hyper-detailed skin pores and texture, Hasselblad medium format photography, depth of field.
```

#### Negative Prompt:
```text
(deformed eyes, asymmetrical face, distorted pupils, unnatural teeth:1.4), bad anatomy, cartoon, anime, 3d render, plastic skin, oversaturated, blurry, low quality, duplicate, extra limbs, altered facial proportions.
```

---

### 4.2 สไตล์สมจริงระดับสตูดิโอ (Cinematic Portrait)

#### Positive Prompt:
```text
Ultra-realistic medium close-up shot of a distinguished character with the precise facial anatomy and bone structure of [Reference Image], authentic skin texture with natural imperfections, warm rim lighting, Rembrandt lighting, captured on Sony A7R V with 85mm f/1.4 GM lens, photorealistic studio photography, elegant modern dark suit, shallow depth of field, sharp focus on eyes, masterpiece quality.
```

#### Negative Prompt:
```text
doll-like, plastic skin, airbrushed, cartoon, extra fingers, mutated hands, blurry eyes, bad lighting, text, watermark, logo, oversaturation.
```

---

### 4.3 สไตล์แฟนตาซี / ภาพวาดคลาสสิก (Fantasy & Vintage)

#### Positive Prompt:
```text
An ornate baroque oil painting portrait of a noble sorcerer, perfectly retaining the recognizable facial identity of [Reference Image], adorned in celestial starry mantle with antique brass talismans, dramatic chiaroscuro lighting, subtle arcane glow in the background, rich color palette, textured canvas brushwork by John Singer Sargent and Caravaggio, high fantasy art, majestic and lifelike face.
```

#### Negative Prompt:
```text
photograph, modern clothing, ugly face, distorted facial features, anime style, flat colors, sketch, low detail.
```

---

## 5. Inpainting / Mask Prompts (เฉพาะจุด)

หากมีภาพร่างหรือภาพตัวละครที่มีองค์ประกอบทุกอย่างสวยงามแล้ว แต่ต้องการ **"เปลี่ยนเฉพาะหน้า"**:

1. **Mask Area:** ระบาย Mask เฉพาะกรอบใบหน้า (เว้นใบหูและไรผมไว้เพื่อให้รอยต่อกลมกลืน)
2. **Denoising Strength:** ตั้งค่าไว้ที่ `0.35 - 0.55` (ถ้าตั้งสูงเกินไปหน้าจะเพี้ยนจากโครงเดิม, ถ้าตั้งต่ำเกินไปหน้าจะไม่เปลี่ยน)
3. **Inpaint Prompt:**
```text
(exact facial likeness of the reference photo:1.3), natural skin tone, photorealistic facial structure, sharp eyes, natural mouth, matching ambient scene lighting and color temperature, seamless blending, ultra-detailed skin texture, realistic reflections in eyes.
```

---

## 6. ข้อแนะนำในการเตรียมภาพจริง

เพื่อให้ AI อ่านค่าใบหน้า (Face Embeddings) ได้แม่นยำที่สุด:

1. **มุมหน้าตรงหรือ 3/4 (Slight 3/4 angle):** หลีกเลี่ยงภาพที่ก้มหน้ามากเกินไปหรือแหงนคอสูง
2. **แสงเคลียร์ (Even Lighting):** ไม่ควรมีเงาพาดผ่านใบหน้าอย่างรุนแรง (เช่น แดดส่องครึ่งหน้า)
3. **ไม่มีสิ่งบดบัง:** ถอดแว่นตากันแดด, หมวกปีกกว้าง, หน้ากากอนามัย หรือผมปรกหน้า
4. **ความละเอียดขั้นต่ำ:** แนะนำภาพที่บริเวณใบหน้ามีขนาดอย่างน้อย `512x512` พิกเซลขึ้นไป
5. **การตั้งค่า Prompt Link:** หากใช้ Discord Midjourney ให้อัปโหลดภาพลง Discord แล้วคลิกขวา `Copy Link` มาวางหน้าสุดของ Prompt เสมอ
