# Hosting Tarteel's Quran Fonts on Vercel

## What is quran-ttx?

The repository contains **Quran font files** for displaying Quran text in the traditional mushaf (physical Quran book) style.

- **Format:** TTX (TrueType XML) font files
- **Content:** 604 font files (one per page of the standard mushaf)
- **Purpose:** Display Quran text as it appears in printed mushafs
- **Source:** https://github.com/TarteelAI/quran-ttx

---

## Why You Might Want This

**Current:**
- Your app shows Quran text in plain Arabic font
- Example: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ (system font)

**With Mushaf Fonts:**
- Shows Quran text as it appears in traditional mushaf
- Beautiful, authentic styling
- Page-by-page rendering
- Example: [Image of mushaf-style text]

---

## Vercel-Compatible Implementation

### Option 1: Host Fonts Directly (Simple) ⭐

Since Tarteel's fonts are in TTX format, we need to convert them to web fonts first.

#### Step 1: Download and Convert Fonts

```bash
# Clone the repo
git clone https://github.com/TarteelAI/quran-ttx.git

# Install fonttools
pip install fonttools

# Convert all TTX to TTF
cd quran-ttx/font-files
for file in *.ttx; do
  ttx -o "${file%.ttx}.ttf" "$file"
done

# Convert TTF to WOFF2 (web-optimized)
for file in *.ttf; do
  woff2_compress "$file"
done
```

#### Step 2: Add to Your Project

```bash
# Create fonts directory in your Next.js project
mkdir -p public/fonts/mushaf

# Copy converted fonts
cp quran-ttx/font-files/*.woff2 public/fonts/mushaf/
```

**Problem:** This adds 604 font files (~100MB+) to your project!
**Vercel Limit:** 100MB total - WON'T FIT! ❌

---

### Option 2: Use Quran.com Fonts (Recommended) ⭐⭐⭐

Quran.com already hosts these fonts on their CDN!

#### Implementation (No hosting needed!)

```typescript
// src/lib/fonts/mushaf-fonts.ts
export class MushafFonts {
  private static FONT_CDN = 'https://fonts.qurancdn.com';
  
  static getPageFontUrl(pageNumber: number): string {
    // Quran.com hosts v1, v2 fonts
    const page = String(pageNumber).padStart(3, '0');
    return `${this.FONT_CDN}/p${page}.woff2`;
  }
  
  static loadPageFont(pageNumber: number): void {
    const fontUrl = this.getPageFontUrl(pageNumber);
    const fontName = `QCF_P${String(pageNumber).padStart(3, '0')}`;
    
    // Load font dynamically
    const font = new FontFace(fontName, `url(${fontUrl})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      console.log(`✓ Loaded mushaf font for page ${pageNumber}`);
    });
  }
}
```

#### Use in Your App

```typescript
// src/components/quran/mushaf-text.tsx
'use client';

import { useEffect } from 'react';
import { MushafFonts } from '@/lib/fonts/mushaf-fonts';

export function MushafText({ 
  pageNumber, 
  text 
}: { 
  pageNumber: number; 
  text: string;
}) {
  useEffect(() => {
    // Load the specific page font
    MushafFonts.loadPageFont(pageNumber);
  }, [pageNumber]);

  const fontName = `QCF_P${String(pageNumber).padStart(3, '0')}`;

  return (
    <div
      className="text-4xl leading-loose text-right"
      style={{ fontFamily: fontName }}
    >
      {text}
    </div>
  );
}
```

**Pros:**
- ✅ FREE CDN hosting (Quran.com)
- ✅ No Vercel storage used
- ✅ Loads only needed fonts
- ✅ Fast global delivery

**Cons:**
- ⚠️ Depends on Quran.com CDN

---

### Option 3: Host on Cloudflare R2 + Vercel

If you want full control without Vercel's 100MB limit:

#### Step 1: Upload to Cloudflare R2

```bash
# Convert fonts (as in Option 1)
# Then upload to R2

wrangler r2 bucket create tilawah-fonts

# Upload all fonts
for file in *.woff2; do
  wrangler r2 object put tilawah-fonts/mushaf/$file --file=$file
done
```

#### Step 2: Make Public

```bash
# Enable public access
wrangler r2 bucket public-access tilawah-fonts --allow
```

#### Step 3: Use in Your App

```typescript
const FONT_CDN = 'https://tilawah-fonts.YOUR-ACCOUNT.r2.dev';

static getPageFontUrl(pageNumber: number): string {
  const page = String(pageNumber).padStart(3, '0');
  return `${FONT_CDN}/mushaf/QCF_P${page}.woff2`;
}
```

**Pros:**
- ✅ Full control
- ✅ No Vercel limit
- ✅ Free tier (10GB)

**Cons:**
- ❌ Need Cloudflare R2 account
- ❌ Extra setup

---

### Option 4: Lazy Load from GitHub (Hacky but Works)

Use GitHub as a CDN directly:

```typescript
export class MushafFonts {
  private static GITHUB_RAW = 'https://raw.githubusercontent.com/TarteelAI/quran-ttx/main/font-files';
  
  static async loadPageFont(pageNumber: number): Promise<void> {
    const page = String(pageNumber).padStart(3, '0');
    const ttxUrl = `${this.GITHUB_RAW}/QCF_P${page}.ttx`;
    
    // Fetch TTX file
    const response = await fetch(ttxUrl);
    const ttxData = await response.text();
    
    // Convert TTX to font data (requires fonttools.js)
    const fontData = await convertTTXtoFont(ttxData);
    
    // Load as FontFace
    const font = new FontFace(`QCF_P${page}`, fontData);
    await font.load();
    document.fonts.add(font);
  }
}
```

**Pros:**
- ✅ No storage needed
- ✅ Uses Tarteel's repo directly

**Cons:**
- ❌ Requires runtime TTX→font conversion
- ❌ Slower
- ❌ GitHub rate limits

---

## Recommended Solution for TilawahQuest

### Use Quran.com CDN (Option 2) ⭐

**Why:**
1. ✅ Already available
2. ✅ No hosting costs
3. ✅ Fast CDN
4. ✅ Vercel-friendly (no storage)
5. ✅ Production-ready

**Implementation Plan:**

```typescript
// 1. Create font loader
// src/lib/fonts/mushaf-fonts.ts

export class MushafFonts {
  private static loaded = new Set<number>();
  private static CDN = 'https://fonts.qurancdn.com';

  static async loadForAyah(surahNumber: number, ayahNumber: number): Promise<void> {
    // Get page number for this ayah
    const pageNumber = this.getPageNumber(surahNumber, ayahNumber);
    
    if (this.loaded.has(pageNumber)) {
      return; // Already loaded
    }

    const fontName = `QCF_P${String(pageNumber).padStart(3, '0')}`;
    const fontUrl = `${this.CDN}/v1/p${pageNumber}.woff2`;

    try {
      const font = new FontFace(fontName, `url(${fontUrl})`);
      await font.load();
      document.fonts.add(font);
      this.loaded.add(pageNumber);
      console.log(`✓ Loaded mushaf font for page ${pageNumber}`);
    } catch (error) {
      console.error(`Failed to load font for page ${pageNumber}:`, error);
      throw error;
    }
  }

  // Map ayah to page number
  static getPageNumber(surah: number, ayah: number): number {
    // Use Quran page mapping
    // (You can get this from AlQuran.cloud API or Tarteel QUL)
    return AYAH_TO_PAGE_MAP[`${surah}:${ayah}`] || 1;
  }
}
```

```typescript
// 2. Use in SessionPractice component
// src/components/quran/session-practice.tsx

useEffect(() => {
  // Preload fonts for all session ayahs
  sessionAyahs.forEach(ayah => {
    MushafFonts.loadForAyah(ayah.surah, ayah.numberInSurah);
  });
}, [sessionAyahs]);

// Render with mushaf font
<div 
  className="text-4xl leading-loose"
  style={{ 
    fontFamily: `QCF_P${pageNumber.toString().padStart(3, '0')}`,
    direction: 'rtl'
  }}
>
  {ayah.text}
</div>
```

---

## Page Mapping Data

You'll need a mapping of ayahs to pages. Get it from:

**Option A: Quran.com API**
```bash
curl https://api.quran.com/api/v4/verses/by_page/1
```

**Option B: Tarteel QUL**
```bash
# Download from QUL
curl https://qul.tarteel.ai/api/pages
```

**Option C: Use existing mapping**
I can create this mapping for you from the Quran data!

---

## Do You Want This?

**Questions:**
1. Do you want mushaf-style fonts? (looks like traditional Quran book)
2. Or keep simple Arabic text? (current)

**If YES, I can:**
1. Create the MushafFonts class
2. Add page mapping data
3. Integrate into SessionPractice
4. Make text look beautiful like Tarteel!

**Estimated Time:** 1 hour
**Vercel Compatible:** ✅ YES (uses external CDN)
**Cost:** FREE

Let me know if you want me to implement this! 🚀
