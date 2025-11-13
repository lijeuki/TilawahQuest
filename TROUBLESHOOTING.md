# TilawahQuest Troubleshooting Guide

## Issue: Detection Stuck on Ayah 1

### Symptoms
- You recite Ayah 1 → System detects it ✓
- You recite Ayah 2 → System still shows Ayah 1 ✗
- Detection doesn't progress forward

### Diagnosis Steps

#### 1. Check Browser Console (F12)

Look for these logs:
```
📝 Accumulated Text: [what's been recognized]
🔄 Partial Text: [current partial recognition]
📍 Current Ayah: [which ayah system thinks you're on]
🎯 Text to Match: [what's being matched]

Table showing all ayah scores:
┌─────────┬──────────┬──────────┐
│ index   │ accuracy │ existing │
├─────────┼──────────┼──────────┤
│ 1       │ 85.5     │ 85.5     │
│ 2       │ 45.2     │ 0        │
│ 3       │ 30.1     │ 0        │
└─────────┴──────────┴──────────┘

✅ MATCHED: Ayah 2 with 45.2%
```

#### 2. What to Look For

**Good Signs:**
- Accumulated text keeps growing
- Table shows different ayah scores
- "MATCHED" messages appear for different ayahs
- "Is Progression: true" when moving forward

**Bad Signs:**
- Accumulated text not growing
- All ayah scores are low (<40%)
- Same ayah matched repeatedly
- "Not updating - current match is better"

### Common Causes & Solutions

#### Cause 1: Speech Recognition Not Working

**Symptoms:**
- No "Accumulated Text" logs
- Microphone icon showing but no text captured

**Solution:**
```
1. Check microphone permission in browser
2. Try different browser (Chrome works best)
3. Speak louder and clearer
4. Check microphone in Windows settings
```

#### Cause 2: Arabic Text Not Recognized

**Symptoms:**
- Text is captured but in wrong language
- Text is gibberish or English

**Solution:**
```
1. Ensure you're speaking Arabic
2. Check browser language settings
3. Chrome → Settings → Languages → Add Arabic
4. Try reciting slower and clearer
```

#### Cause 3: Matching Threshold Too High

**Symptoms:**
- Table shows good scores (50-60%)
- But no matches made
- "No match found above threshold"

**Current Threshold:** 40%

**If needed, lower it:**
```typescript
// In session-practice.tsx, line ~144
if (verification.accuracy > 40) {  // Lower from 40 to 30
```

#### Cause 4: Text Accumulation Issue

**Symptoms:**
- Accumulated text keeps growing
- Includes Ayah 1 + Ayah 2 text together
- System matches the combined text to Ayah 1

**Solution:** This is actually working as designed. The system should still detect Ayah 2 when its text is included. Check the accuracy scores.

#### Cause 5: Recognition Stops

**Symptoms:**
- Logs stop appearing
- "Recognition ended" message
- Mic button still active but not listening

**Solution:**
- Recognition should auto-restart
- If not, click Stop then Start again
- Check console for restart errors

### Testing Steps

#### Test 1: Simple Al-Fatihah Test

1. Select "Al-Fatihah" (7 ayahs, short)
2. Open console (F12)
3. Click microphone
4. Slowly recite:

```
Ayah 1: "bismillahir rahmanir rahim"
[Wait 2 seconds]
Check console: Should see Ayah 1 matched

Ayah 2: "alhamdu lillahi rabbil alamin"
[Wait 2 seconds]
Check console: Should see Ayah 2 matched
```

#### Test 2: Check Scores

Look at the accuracy table:
- Ayah 1 should drop when you say Ayah 2
- Ayah 2 should rise above 40%
- Best match should switch to Ayah 2

#### Test 3: Progression Detection

When you move from Ayah 1 → Ayah 2:
- Look for "Is Progression: true"
- This lowers threshold to 45% (easier to detect)
- Should help catch when you move forward

### Manual Threshold Adjustment

If detection is too strict, you can lower thresholds:

**File:** `src/components/quran/session-practice.tsx`

**Line ~144:** Base threshold
```typescript
if (verification.accuracy > 40) {  // Change to 30 or 35
```

**Line ~159:** Progression threshold
```typescript
const shouldUpdate = isBetterMatch || (isProgression && bestMatch.accuracy > 45);
// Change 45 to 40 or 35
```

**After changes:**
```bash
npm run build
npm run dev
```

### Advanced Debugging

#### Enable Verbose Logging

The system already has detailed logs. Look for:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Accumulated Text: بسم الله الرحمن الرحيم الحمد لله رب العالمين
🔄 Partial Text: 
📍 Current Ayah: 1
🎯 Text to Match: بسم الله الرحمن الرحيم الحمد لله رب العالمين...

┌─────────┬──────────┬──────────┐
│ index   │ accuracy │ existing │
├─────────┼──────────┼──────────┤
│ 1       │ 65.5     │ 85.5     │  <- Lower now because text includes Ayah 2
│ 2       │ 75.2     │ 0        │  <- Higher! Should match this
│ 3       │ 25.1     │ 0        │
└─────────┴──────────┴──────────┘

✅ MATCHED: Ayah 2 with 75.2%
   Previous was: Ayah 1
   Is Progression: true
```

#### Check Text Normalization

The system removes diacritics and normalizes Arabic. To test:

```typescript
// In browser console
const text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
// Should become: "بسم الله الرحمن الرحيم"
```

### Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| No audio detected | Check mic permissions, speak louder |
| Wrong language | Switch to Chrome, add Arabic language |
| Stuck on Ayah 1 | Check console logs, verify accuracy scores |
| All scores low | Speak more clearly, check Arabic pronunciation |
| Recognition stops | Should auto-restart, if not click Stop→Start |
| Scores good but no match | Lower threshold from 40 to 30-35 |

### Best Practices

**For Best Detection:**
1. ✅ Use Chrome or Edge browser
2. ✅ Speak clearly and at moderate pace
3. ✅ Pause slightly between ayahs (1-2 seconds)
4. ✅ Quiet environment (no background noise)
5. ✅ Good microphone quality
6. ✅ Keep console open to monitor
7. ✅ Watch the accuracy table
8. ✅ Start with short surahs (Al-Fatihah)

**Recitation Tips:**
- Don't rush through ayahs
- Pronounce Arabic letters clearly
- Use proper tajweed (helps recognition!)
- Pause between ayahs
- Watch "Current Ayah" indicator

### Still Not Working?

Try these in order:

1. **Restart Browser**
   - Close all tabs
   - Open fresh
   - Try again

2. **Try Different Surah**
   - Start with Al-Fatihah (easiest)
   - Avoid long ayahs at first

3. **Check Web Speech API**
   ```javascript
   // In console
   'webkitSpeechRecognition' in window
   // Should return: true
   ```

4. **Lower All Thresholds**
   - Base: 40 → 30
   - Progression: 45 → 35
   - Min text length: 3 → 2

5. **Report Issue**
   - Copy console logs
   - Note which surah
   - Contact on [LinkedIn](https://www.linkedin.com/in/rizkkkky/)

### Getting Help

**When reporting issues, include:**
1. Browser name and version
2. Console logs (full output)
3. Which surah you're testing
4. Screenshot of accuracy table
5. What you recited vs what was detected

**Contact:**
- LinkedIn: https://www.linkedin.com/in/rizkkkky/
- GitHub: https://github.com/lijeuki/TilawahQuest/issues

---

May Allah make this tool beneficial for all! InsyaAllah the detection will work well with these improvements. 🤲
