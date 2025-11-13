# Audio Setup Guide

## Current Status

TilawahQuest currently uses **verses.quran.com** CDN for reference audio (Mishary Alafasy recitation).

**Audio URL Format:**
```
https://verses.quran.com/Alafasy/mp3/001001.mp3
```

Where:
- `001` = Surah number (padded to 3 digits)
- `001` = Ayah number (padded to 3 digits)

## Why verses.quran.com?

✅ **Better CORS support** than EveryAyah.com  
✅ **Reliable CDN** with good uptime  
✅ **High quality** Mishary Alafasy recitation  
✅ **Free to use** for Islamic projects

## Option: Self-Hosting Audio Files

If you want to host audio files yourself for better reliability:

### Step 1: Download All Audio Files

```bash
# Create public audio directory
mkdir -p public/audio/alafasy

# Download script (Python example)
python scripts/download_audio.py
```

### Step 2: Download Script

Create `scripts/download_audio.py`:

```python
import requests
import os
from time import sleep

# Total ayahs in Quran
QURAN_DATA = [
    (1, 7), (2, 286), (3, 200), (4, 176), (5, 120),
    # ... add all 114 surahs with ayah counts
]

def download_audio():
    for surah_num, ayah_count in QURAN_DATA:
        for ayah_num in range(1, ayah_count + 1):
            surah = str(surah_num).zfill(3)
            ayah = str(ayah_num).zfill(3)
            
            url = f"https://verses.quran.com/Alafasy/mp3/{surah}{ayah}.mp3"
            filename = f"public/audio/alafasy/{surah}{ayah}.mp3"
            
            if os.path.exists(filename):
                print(f"Skip: {surah}{ayah}.mp3")
                continue
                
            print(f"Downloading: {surah}{ayah}.mp3")
            try:
                response = requests.get(url, timeout=30)
                if response.status_code == 200:
                    with open(filename, 'wb') as f:
                        f.write(response.content)
                    print(f"✓ Saved: {surah}{ayah}.mp3")
                else:
                    print(f"✗ Failed: {surah}{ayah}.mp3 - Status {response.status_code}")
            except Exception as e:
                print(f"✗ Error: {surah}{ayah}.mp3 - {e}")
            
            sleep(0.1)  # Be respectful to the server

if __name__ == "__main__":
    os.makedirs("public/audio/alafasy", exist_ok=True)
    download_audio()
```

### Step 3: Update Audio Player

Modify `src/lib/audio/audio-player.ts`:

```typescript
getAudioUrl(surahNumber: number, ayahNumber: number): string {
  const surah = String(surahNumber).padStart(3, '0');
  const ayah = String(ayahNumber).padStart(3, '0');
  
  // Use local audio files
  return `/audio/alafasy/${surah}${ayah}.mp3`;
}
```

### Step 4: Compress Audio (Optional)

To save bandwidth, compress the MP3 files:

```bash
# Install ffmpeg
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: sudo apt install ffmpeg

# Compress all files
for file in public/audio/alafasy/*.mp3; do
  ffmpeg -i "$file" -b:a 64k -ar 22050 "${file%.mp3}_compressed.mp3"
done
```

## Storage Requirements

**Full Quran Audio (Alafasy):**
- Total files: ~6,236 ayahs
- Average size: ~50-100 KB per ayah
- Total size: ~300-600 MB uncompressed
- Compressed (64kbps): ~150-300 MB

## Recommended Approach

For production deployment:

1. **Option A: Use CDN** (Current)
   - ✅ No storage needed
   - ✅ No bandwidth cost
   - ⚠️ Depends on external service

2. **Option B: Self-Host**
   - ✅ Full control
   - ✅ Better reliability
   - ❌ Storage cost (~300 MB)
   - ❌ Bandwidth cost

3. **Option C: Hybrid**
   - Use CDN as primary
   - Fallback to self-hosted if CDN fails
   - Best of both worlds

## Implementation Status

✅ **Current**: Using verses.quran.com CDN  
✅ **Error handling**: Better error messages  
✅ **Loading feedback**: Console logs for debugging  
⏳ **Future**: Option to download and self-host

## Troubleshooting

**Audio not playing?**
1. Check browser console for errors
2. Verify internet connection
3. Try different browser (Chrome recommended)
4. Check if URL is accessible: https://verses.quran.com/Alafasy/mp3/001001.mp3

**CORS errors?**
- verses.quran.com has CORS enabled
- If issues persist, self-host the files

**Slow loading?**
- Consider self-hosting
- Or use service worker for caching
- Or preload next ayah audio

## Contact

For audio hosting questions or issues, contact the developer on [LinkedIn](https://www.linkedin.com/in/rizkkkky/).
