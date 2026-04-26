import { useState, useCallback, useRef } from 'react';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah - news narrator)

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const speak = useCallback(async (text, audioId) => {
    // If already speaking this audio, stop it
    if (currentAudioId === audioId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      setCurrentAudioId(null);
      return;
    }

    // If speaking different audio, stop that first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!ELEVENLABS_API_KEY) {
      setError('ElevenLabs API key not configured');
      console.error('VITE_ELEVENLABS_API_KEY not set in .env');
      return;
    }

    setIsSpeaking(true);
    setCurrentAudioId(audioId);
    setError(null);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentAudioId(null);
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsSpeaking(false);
        setCurrentAudioId(null);
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (err) {
      console.error('[TTS] Error:', err);
      setError(err.message);
      setIsSpeaking(false);
      setCurrentAudioId(null);
      audioRef.current = null;
    }
  }, [currentAudioId]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentAudioId(null);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    currentAudioId,
    error,
  };
}