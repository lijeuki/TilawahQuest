/**
 * Script to download and process Quran data from Tarteel AI's EveryAyah dataset
 * Run with: node scripts/download-quran-data.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Use Tanzil API for Quran text
const QURAN_TEXT_URL = 'https://api.alquran.cloud/v1/quran/ar.alafasy';
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

async function downloadJSON(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'TilawahQuest/1.0'
      }
    };

    https.get(options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadJSON(res.headers.location).then(resolve).catch(reject);
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('Parse error:', e);
          console.error('Data received:', data.substring(0, 200));
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function processQuranData() {
  console.log('Downloading Quran data from AlQuran Cloud API...');
  
  try {
    const response = await downloadJSON(QURAN_TEXT_URL);
    
    if (!response.data || !response.data.surahs) {
      throw new Error('Invalid API response structure');
    }
    
    // Transform to our format
    const ayahs = [];
    let ayahNumber = 1;
    
    for (const surah of response.data.surahs) {
      for (const ayah of surah.ayahs) {
        ayahs.push({
          number: ayahNumber++,
          text: ayah.text,
          numberInSurah: ayah.numberInSurah,
          juz: ayah.juz,
          page: ayah.page,
          surah: surah.number
        });
      }
    }
    
    // Save to file
    const outputPath = path.join(DATA_DIR, 'quran.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify({ ayahs }, null, 2),
      'utf8'
    );
    
    console.log(`✓ Successfully downloaded ${ayahs.length} ayahs from ${response.data.surahs.length} surahs`);
    console.log(`✓ Saved to: ${outputPath}`);
    console.log('✓ Ready to use in the application!');
    
  } catch (error) {
    console.error('Error downloading Quran data:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

processQuranData();
