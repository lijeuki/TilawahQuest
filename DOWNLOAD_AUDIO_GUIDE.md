# Audio Download Guide

## Quick Start

### Step 1: Run the Download Script

Simply double-click the `download_audio.bat` file in the project root, or run from command prompt:

```cmd
cd C:\Users\rizkk\Documents\TilawahQuest\tilawah-quest
download_audio.bat
```

### Step 2: Wait for Download

The script will:
- ✅ Download all 6,236 ayah audio files
- ✅ Organize by surah name and ayah number
- ✅ Create proper directory structure
- ✅ Skip already downloaded files
- ✅ Create detailed log file
- ⏱️ Takes approximately 30-60 minutes

### Step 3: Files Will Be Downloaded To

```
public/audio/alafasy/
├── 001001.mp3  (Al-Fatihah, Ayah 1)
├── 001002.mp3  (Al-Fatihah, Ayah 2)
├── ...
└── 114006.mp3  (An-Nas, Ayah 6)
```

### Step 4: Application Will Auto-Use Local Files

When running on localhost, the app automatically uses local audio files instead of CDN.

## Download Script Features

✅ **Smart Resume** - Skips already downloaded files (you can stop and resume anytime)
✅ **Detailed Logging** - Creates timestamped log file in `public/audio/logs/`
✅ **Surah Names** - Shows which surah is being downloaded
✅ **Progress Display** - See each file as it downloads
✅ **Error Handling** - Reports failed downloads in log
✅ **Auto-Organize** - Creates proper folder structure

## Example Output

```
========================================
  TilawahQuest Audio Downloader
========================================

Creating directory structure...
Starting download...

[001] Downloading Al-Fatihah (7 ayahs)...
  [OK] 001001.mp3 - Al-Fatihah Ayah 1
  [OK] 001002.mp3 - Al-Fatihah Ayah 2
  [OK] 001003.mp3 - Al-Fatihah Ayah 3
  [OK] 001004.mp3 - Al-Fatihah Ayah 4
  [OK] 001005.mp3 - Al-Fatihah Ayah 5
  [OK] 001006.mp3 - Al-Fatihah Ayah 6
  [OK] 001007.mp3 - Al-Fatihah Ayah 7
[001] Al-Fatihah complete!

[002] Downloading Al-Baqarah (286 ayahs)...
  [OK] 002001.mp3 - Al-Baqarah Ayah 1
  [OK] 002002.mp3 - Al-Baqarah Ayah 2
  ...
```

## File Naming Convention

**Format:** `SSSAAA.mp3`
- `SSS` = Surah number (3 digits, padded with zeros)
- `AAA` = Ayah number (3 digits, padded with zeros)

**Examples:**
- `001001.mp3` = Surah 1 (Al-Fatihah), Ayah 1
- `002286.mp3` = Surah 2 (Al-Baqarah), Ayah 286
- `114006.mp3` = Surah 114 (An-Nas), Ayah 6

## Storage Requirements

- **Total Files:** 6,236 ayahs
- **File Size:** ~50-100 KB per ayah (varies by length)
- **Total Size:** ~300-600 MB
- **Free Space Needed:** At least 1 GB recommended

## Troubleshooting

### "curl is not installed"

**Windows 10/11:** curl is built-in, should work automatically

**Older Windows:**
```cmd
# Option 1: Install curl
winget install curl.curl

# Option 2: Use chocolatey
choco install curl
```

### Download is slow

- Normal! 6,236 files takes time
- Average: ~2-3 files per second
- You can stop and resume anytime (already downloaded files are skipped)

### Some files failed to download

Check the log file:
```
public\audio\logs\download_log_YYYYMMDD_HHMMSS.txt
```

Look for `[FAIL]` entries and note which files failed.

Re-run the script - it will only download missing files!

### Need to re-download everything

Delete the folder and run again:
```cmd
rmdir /s /q public\audio\alafasy
download_audio.bat
```

## How the App Uses Local Audio

**Automatic Detection:**
```typescript
// In audio-player.ts
const useLocal = window.location.hostname === 'localhost';

if (useLocal) {
  return `/audio/alafasy/${surah}${ayah}.mp3`;  // Local
} else {
  return `https://verses.quran.com/...`;  // CDN
}
```

**Development (localhost):**
- ✅ Uses local files if available
- ✅ Faster loading (no internet needed)
- ✅ No bandwidth usage

**Production (deployed):**
- ✅ Uses CDN (verses.quran.com)
- ✅ No storage cost
- ✅ Global CDN speed

## Log File Location

After download completes, check:
```
public\audio\logs\download_log_YYYYMMDD_HHMMSS.txt
```

The log contains:
- Start time
- Each file downloaded/skipped/failed
- Complete surah confirmations
- Any errors with URLs

## Benefits of Local Audio

✅ **Faster Loading** - No internet latency
✅ **Offline Development** - Work without internet
✅ **Privacy** - No external requests
✅ **Reliability** - Not dependent on CDN uptime
✅ **Full Control** - Can compress or modify files

## Next Steps

After downloading:

1. **Test in browser:** http://localhost:3000/practice
2. **Select any surah**
3. **Click "Play All 10 Ayahs"**
4. **Should load instantly from local files!**

## Deployment Options

**Option A: Don't Deploy Audio** (Recommended for Vercel)
- Keep using CDN (verses.quran.com) in production
- Only local files for development
- No storage cost, no bandwidth cost

**Option B: Deploy with Audio** (For custom hosting)
- Upload entire `public/audio/` folder
- ~300-600 MB storage needed
- Faster for users (no CDN)

**Option C: Use Cloud Storage**
- Upload to AWS S3, Cloudflare R2, etc.
- Update `getAudioUrl()` to point to your bucket
- Pay for storage + bandwidth

## Questions?

Check the console logs when playing audio to see which source is being used:
```
Loading audio from: /audio/alafasy/001001.mp3    // Local
Loading audio from: https://verses.quran.com/... // CDN
```

Contact on [LinkedIn](https://www.linkedin.com/in/rizkkkky/) for help!
