import { supabase } from './client';
import type { AyahAttempt } from '@/types/quran';

export async function saveAyahAttempt(attempt: Omit<AyahAttempt, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('ayah_attempts')
    .insert([{
      session_id: attempt.sessionId,
      surah_number: attempt.surahNumber,
      ayah_number: attempt.ayahNumber,
      recognized_text: attempt.recognizedText,
      confidence_score: attempt.confidenceScore,
      audio_url: attempt.audioUrl
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAttemptsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from('ayah_attempts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAttemptsBySurah(sessionId: string, surahNumber: number) {
  const { data, error } = await supabase
    .from('ayah_attempts')
    .select('*')
    .eq('session_id', sessionId)
    .eq('surah_number', surahNumber)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
