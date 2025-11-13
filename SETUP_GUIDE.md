# TilawahQuest Setup Guide

This guide will walk you through setting up TilawahQuest from scratch.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/up
2. Click "New Project"
3. Fill in:
   - **Project Name**: tilawah-quest
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to your target users
   - **Pricing Plan**: Free (sufficient for MVP)
4. Click "Create new project" and wait ~2 minutes for setup

### Configure Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned" message

### Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal")

### Set Up Storage Bucket (Optional - for audio storage)

1. Go to **Storage** in the sidebar
2. Click "Create a new bucket"
3. Name it: `audio-recordings`
4. Make it **Private**
5. Click "Create bucket"

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   # Efferd Pro (already provided)
   EFFERD_REGISTRY_TOKEN=registry_5CJ40Qns84mDGIGRD6MYulFMkVQJjweQ
   
   # Supabase (replace with your values)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Save the file

## Step 4: Add Quran Data (Critical)

The app currently has limited surah data. To make it functional, you need to add complete Quran data:

### Option A: Use Tarteel's Quranic Universal Library (Recommended)

1. Download from: https://github.com/TareefAzizi/quranic-universal-library
2. Look for the Arabic text JSON file
3. Convert to match this format:

```json
{
  "ayahs": [
    {
      "number": 1,
      "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "numberInSurah": 1,
      "juz": 1,
      "page": 1,
      "surah": 1
    }
    // ... more ayahs
  ]
}
```

4. Save as `src/data/quran.json`

### Option B: Use Tanzil.net Data

1. Go to https://tanzil.net/download/
2. Download "Simple Clean" XML format
3. Convert XML to JSON format matching the structure above
4. Save as `src/data/quran.json`

### Update the Data Loader

Edit `src/lib/quran/data.ts`:

```typescript
import quranData from '@/data/quran.json';

export async function getQuranData() {
  if (quranCache) return quranCache;

  quranCache = {
    ayahs: quranData.ayahs, // Load from JSON
    surahs: surahs
  };

  return quranCache;
}
```

## Step 5: Test the Application

### Start Development Server

```bash
npm run dev
```

### Test Checklist

1. ✅ Open http://localhost:3000
2. ✅ Landing page loads correctly
3. ✅ Click "Start Practicing" → navigates to /practice
4. ✅ Click microphone button → browser asks for permission
5. ✅ Grant permission → microphone button becomes active
6. ✅ Click to record → timer starts
7. ✅ Recite Surah Al-Fatihah (first surah)
8. ✅ Click stop → processing starts
9. ✅ Results appear with:
   - Recognized text
   - Identified ayah
   - Confidence score
   - Correct Arabic text

### Troubleshooting

#### "Speech recognition not supported"
- **Solution**: Use Chrome or Edge browser (Safari on iOS also works)

#### "Microphone permission denied"
- **Solution**: Check browser settings → Site permissions → Allow microphone

#### "Could not match any ayah"
- **Solution**: 
  - Ensure Quran data is loaded (check browser console for errors)
  - Try reciting more clearly and slowly
  - Recite at least 3-4 words from the ayah

#### Supabase connection errors
- **Solution**:
  - Verify `.env.local` has correct values
  - Check Supabase project is active (not paused)
  - Ensure database migration was run successfully

## Step 6: Deploy to Vercel (Optional)

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/tilawah-quest.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Add environment variables:
     - `EFFERD_REGISTRY_TOKEN`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Click "Deploy"

3. **Test Production**:
   - Wait for deployment to complete
   - Visit your production URL
   - Test recording functionality (HTTPS required for microphone)

## Next Steps

### Enhance Recognition Accuracy
1. Collect user feedback on incorrect matches
2. Fine-tune the fuzzy matching algorithm
3. Consider adding OpenAI Whisper as fallback for better accuracy

### Add More Features
1. Audio playback from EveryAyah.com
2. Progress dashboard
3. User authentication
4. Tajweed highlighting
5. Memorization tools

### Optimize Performance
1. Add caching for Quran data
2. Implement service worker for offline support
3. Optimize bundle size
4. Add loading skeletons

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables
3. Ensure Supabase project is configured correctly
4. Open an issue on GitHub with:
   - Error message
   - Browser and OS
   - Steps to reproduce

## Security Checklist

Before deploying to production:

- ✅ `.env.local` is gitignored (never commit secrets!)
- ✅ `.env.example` has empty values
- ✅ Supabase RLS policies are enabled
- ✅ Service role key is only used in server-side code
- ✅ HTTPS is enabled (automatic on Vercel)
- ✅ CORS is properly configured
- ✅ Rate limiting is implemented

---

**Happy Building! 🚀**
