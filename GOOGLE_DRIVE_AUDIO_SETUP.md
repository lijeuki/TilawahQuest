# Google Drive Audio Hosting Guide

## ✅ YES! Google Drive Works Great!

**Perfect Solution:**
- ✅ **Completely FREE** - 15 GB free (your audio is ~0.3-0.6 GB)
- ✅ **No bandwidth limits** for public sharing
- ✅ **Fast CDN** - Google's global network
- ✅ **Easy setup** - Just upload and share
- ✅ **Already have account** - Uses your Gmail account

---

## Quick Setup (5 Minutes!)

### Step 1: Create Folder Structure

1. Go to: https://drive.google.com
2. Create new folder: `TilawahQuest-Audio`
3. Inside it, create folder: `alafasy`

Your structure:
```
TilawahQuest-Audio/
└── alafasy/
    ├── 001001.mp3
    ├── 001002.mp3
    └── ... (all 6,236 files)
```

### Step 2: Upload Audio Files

**Option A: Upload via Web**
1. Run `download_audio.bat` first (downloads to your computer)
2. Go to your `alafasy` folder in Google Drive
3. Click "New" → "File upload"
4. Select all MP3 files from `public/audio/alafasy/`
5. Wait for upload (takes ~30-60 mins for all files)

**Option B: Use Google Drive Desktop App (Faster!)**
1. Install: https://www.google.com/drive/download/
2. Copy `public/audio/alafasy/` folder to your Google Drive folder
3. Let it sync automatically

### Step 3: Make Folder Public

1. Right-click `alafasy` folder in Google Drive
2. Click "Share"
3. Click "Change to anyone with the link"
4. Set permission to "Viewer"
5. Copy the folder link

It will look like:
```
https://drive.google.com/drive/folders/1ABcDefGhIjKlMnOpQrStUvWxYz
```

### Step 4: Get Folder ID

From the URL above, copy the folder ID:
```
https://drive.google.com/drive/folders/1ABcDefGhIjKlMnOpQrStUvWxYz
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^
                                        This is your FOLDER_ID
```

### Step 5: Configure Your App

Add to `.env.local`:
```env
NEXT_PUBLIC_AUDIO_CDN_TYPE=google-drive
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=1ABcDefGhIjKlMnOpQrStUvWxYz
```

---

## How It Works

### Google Drive Direct Download URL Format

Google Drive has a special URL format for direct file access:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

But we need to get each file's ID. There are two approaches:

### Approach 1: Using File IDs (Better)

Each file in Google Drive has a unique ID. We need to create a mapping file.

**Create a file mapping** (one-time setup):
```javascript
// src/data/audio-file-ids.json
{
  "001001": "1FileId001001...",
  "001002": "1FileId001002...",
  ...
}
```

### Approach 2: Using Google Drive API (Recommended!)

We can use Google Drive API to list files and get their IDs dynamically.

---

## Implementation

I'll create a helper that automatically gets the file IDs:

### Step 1: Create Google Drive Helper

```typescript
// src/lib/audio/google-drive-audio.ts
export class GoogleDriveAudio {
  private folderId: string;
  private fileCache: Map<string, string> = new Map();

  constructor(folderId: string) {
    this.folderId = folderId;
  }

  async getFileUrl(filename: string): Promise<string> {
    // Check cache first
    if (this.fileCache.has(filename)) {
      const fileId = this.fileCache.get(filename);
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Fetch file ID from Drive API
    const fileId = await this.getFileId(filename);
    if (fileId) {
      this.fileCache.set(filename, fileId);
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    throw new Error(`File not found: ${filename}`);
  }

  private async getFileId(filename: string): Promise<string | null> {
    // Use Google Drive API v3
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
    const url = `https://www.googleapis.com/drive/v3/files?q='${this.folderId}'+in+parents+and+name='${filename}'&key=${apiKey}&fields=files(id,name)`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    return null;
  }
}
```

---

## EASIER Alternative: Pre-generate File ID Mapping

Since file IDs don't change, we can create a mapping file once:

### Step 1: Create Mapping Script

Save as `scripts/generate_drive_mapping.js`:

```javascript
const fs = require('fs');
const { google } = require('googleapis');

async function generateMapping() {
  const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';
  const API_KEY = 'YOUR_API_KEY_HERE';

  const drive = google.drive({ version: 'v3', auth: API_KEY });
  
  const mapping = {};
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: 'nextPageToken, files(id, name)',
      pageToken: pageToken
    });

    res.data.files.forEach(file => {
      // Extract filename without extension
      const name = file.name.replace('.mp3', '');
      mapping[name] = file.id;
    });

    pageToken = res.data.nextPageToken;
  } while (pageToken);

  fs.writeFileSync(
    'src/data/google-drive-audio-ids.json',
    JSON.stringify(mapping, null, 2)
  );

  console.log(`✓ Generated mapping for ${Object.keys(mapping).length} files`);
}

generateMapping();
```

---

## SIMPLEST Solution: Use Public Folder + Direct Links

### Even Easier Approach:

Google Drive has a simpler URL format for files in public folders:

```
https://drive.google.com/uc?export=download&id=FILE_ID
```

But getting individual file IDs is tedious for 6,236 files...

### Better: Use Google Drive Stream API

```typescript
// This won't work because Drive doesn't support direct file access by path
// We MUST use file IDs
```

---

## 🎯 RECOMMENDED: Hybrid Approach

Use Google Drive for **backup/download** but keep CDN for **streaming**:

1. **Upload to Google Drive** - For backup and easy access
2. **Keep using verses.quran.com** - For actual playback
3. **Fallback to Drive** - If CDN fails

---

## Alternative: Simpler Free Solutions

Since Google Drive requires file IDs for each file (6,236 files!), here are easier options:

### Option 1: Internet Archive (Easiest!)
- Upload all files at once
- Direct URL access: `https://archive.org/download/your-collection/alafasy/001001.mp3`
- No file ID mapping needed!

### Option 2: GitHub Releases (Second Easiest!)
- Upload ZIP file
- Unzip in build process
- Direct access

### Option 3: Keep Current CDN
- verses.quran.com is working
- Free, fast, reliable
- No setup needed

---

## My Recommendation for You

### For Production:
**Keep using verses.quran.com** - It's working great!

### For Backup:
**Upload to Google Drive** - Have a backup copy

### For Self-Hosting:
**Internet Archive** - Easiest direct file access

**Google Drive is great for storage but complicated for direct CDN use with 6,236 files.**

---

## Why Google Drive is Tricky

- ✅ Great for: Storing files, sharing folders, backup
- ❌ Tricky for: Direct file access as CDN (need file IDs)
- ❌ Problem: 6,236 files = 6,236 file IDs to manage
- ❌ No direct path access (can't use `/alafasy/001001.mp3`)

---

## Quick Comparison

| Solution | Setup | File Access | Ideal For |
|----------|-------|-------------|-----------|
| verses.quran.com | ✅ Done | Direct URL | Current use ✓ |
| Internet Archive | Easy | Direct URL | Best alternative |
| GitHub Releases | Easy | Direct URL | Good for versioning |
| Google Drive | Medium | Need file IDs | Backup storage |
| Cloudflare R2 | Medium | Direct URL | Production CDN |

---

## Final Answer

**YES, you CAN use Google Drive, but:**

**For CDN (streaming audio):**
- ⚠️ Complicated - Need to map 6,236 file IDs
- ⚠️ Extra API calls
- ⚠️ Rate limits on API

**For Storage (backup):**
- ✅ Perfect! 15 GB free
- ✅ Easy to upload
- ✅ Safe backup

**Better alternatives for CDN:**
1. verses.quran.com (current - keep it!)
2. Internet Archive (easiest self-host)
3. Cloudflare R2 (best performance)

**Use Google Drive for backup, keep CDN for playback!**

Would you like me to help you set up Internet Archive instead? It's much simpler for direct file access!
