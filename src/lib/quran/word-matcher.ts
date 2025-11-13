/**
 * Word-by-word matching for detailed feedback
 * Similar to Tarteel's approach
 */

import { normalizeArabicText } from './text-processor';

export interface WordMatch {
  word: string;
  position: number;
  isCorrect: boolean;
  confidence: number;
  expectedWord?: string;
}

export interface VerificationResult {
  isCorrect: boolean;
  accuracy: number;
  wordMatches: WordMatch[];
  mistakes: Array<{
    position: number;
    expected: string;
    received: string;
    type: 'missing' | 'wrong' | 'extra';
  }>;
}

/**
 * Verify if recited text matches expected ayah word-by-word
 */
export function verifyAyahRecitation(
  recitedText: string,
  expectedText: string
): VerificationResult {
  // Normalize both texts
  const normalizedRecited = normalizeArabicText(recitedText);
  const normalizedExpected = normalizeArabicText(expectedText);
  
  // Quick check: if recited text contains significant portion of expected
  if (normalizedRecited.length > 10 && normalizedExpected.length > 10) {
    // Check if expected text is contained in recited (partial match)
    if (normalizedRecited.includes(normalizedExpected)) {
      return {
        isCorrect: true,
        accuracy: 100,
        wordMatches: [],
        mistakes: []
      };
    }
  }
  
  const recitedWords = normalizedRecited
    .split(' ')
    .filter(w => w.length > 0);
  
  const expectedWords = normalizedExpected
    .split(' ')
    .filter(w => w.length > 0);

  const wordMatches: WordMatch[] = [];
  const mistakes: VerificationResult['mistakes'] = [];
  let correctCount = 0;

  // Match word by word
  const maxLength = Math.max(recitedWords.length, expectedWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const recited = recitedWords[i] || '';
    const expected = expectedWords[i] || '';

    if (!expected && recited) {
      // Extra word
      wordMatches.push({
        word: recited,
        position: i,
        isCorrect: false,
        confidence: 0
      });
      mistakes.push({
        position: i,
        expected: '',
        received: recited,
        type: 'extra'
      });
    } else if (expected && !recited) {
      // Missing word
      wordMatches.push({
        word: '',
        position: i,
        isCorrect: false,
        confidence: 0,
        expectedWord: expected
      });
      mistakes.push({
        position: i,
        expected,
        received: '',
        type: 'missing'
      });
    } else if (recited && expected) {
      // Check if words match
      const similarity = calculateWordSimilarity(recited, expected);
      const isCorrect = similarity > 80; // 80% threshold

      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push({
          position: i,
          expected,
          received: recited,
          type: 'wrong'
        });
      }

      wordMatches.push({
        word: recited,
        position: i,
        isCorrect,
        confidence: similarity,
        expectedWord: expected
      });
    }
  }

  const accuracy = (correctCount / expectedWords.length) * 100;
  const isCorrect = accuracy >= 90; // 90% accuracy threshold

  return {
    isCorrect,
    accuracy,
    wordMatches,
    mistakes
  };
}

/**
 * Calculate similarity between two words
 */
function calculateWordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 100;
  
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 100;
  
  let matches = 0;
  const minLen = Math.min(word1.length, word2.length);
  
  for (let i = 0; i < minLen; i++) {
    if (word1[i] === word2[i]) {
      matches++;
    }
  }
  
  return (matches / maxLen) * 100;
}

/**
 * Get original (non-normalized) words with their match status
 */
export function mapWordsToOriginal(
  originalText: string,
  wordMatches: WordMatch[]
): Array<{ word: string; isCorrect: boolean; confidence: number }> {
  const originalWords = originalText.split(' ').filter(w => w.length > 0);
  
  return originalWords.map((word, index) => ({
    word,
    isCorrect: wordMatches[index]?.isCorrect ?? false,
    confidence: wordMatches[index]?.confidence ?? 0
  }));
}
