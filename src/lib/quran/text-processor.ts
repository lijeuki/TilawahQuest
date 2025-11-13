/**
 * Normalize Arabic text for matching
 * - Remove diacritics (tashkeel)
 * - Normalize hamza variants
 * - Remove extra whitespace
 */
export function normalizeArabicText(text: string): string {
  return text
    // Remove diacritics (harakat)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize ALL alef variants to simple alef
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')  // Added \u0671 (Alif Wasla)
    // Normalize yaa variants
    .replace(/\u0649/g, '\u064A')
    // Normalize taa marbouta
    .replace(/\u0629/g, '\u0647')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Normalize hamza variants
    .replace(/[\u0624\u0626]/g, '')  // Remove hamza on waw and yaa
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity percentage between two strings
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeArabicText(str1);
  const normalized2 = normalizeArabicText(str2);
  
  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshteinDistance(normalized1, normalized2);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.max(0, Math.min(100, similarity));
}

/**
 * Check if the recognized text contains key words from the ayah
 */
export function containsKeyWords(recognizedText: string, ayahText: string, threshold: number = 3): boolean {
  const recognizedWords = normalizeArabicText(recognizedText).split(' ').filter(w => w.length > 2);
  const ayahWords = normalizeArabicText(ayahText).split(' ').filter(w => w.length > 2);
  
  let matchCount = 0;
  for (const word of recognizedWords) {
    if (ayahWords.some(ayahWord => ayahWord.includes(word) || word.includes(ayahWord))) {
      matchCount++;
    }
  }
  
  return matchCount >= threshold;
}
