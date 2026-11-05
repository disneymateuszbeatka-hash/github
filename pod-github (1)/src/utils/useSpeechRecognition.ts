import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      setSupported(true);
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'pl-PL'; // Polish language recognition

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript && onResultCallbackRef.current) {
          onResultCallbackRef.current(transcript.trim());
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        setActiveItemId(null);
      };

      rec.onend = () => {
        setIsListening(false);
        setActiveItemId(null);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = useCallback(
    (itemId: string, onResult: (text: string) => void) => {
      if (!recognitionRef.current) return;
      try {
        if (isListening) {
          recognitionRef.current.abort();
        }
        onResultCallbackRef.current = onResult;
        setActiveItemId(itemId);
        setIsListening(true);
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start error:', err);
        setIsListening(false);
        setActiveItemId(null);
      }
    },
    [isListening]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setActiveItemId(null);
    }
  }, [isListening]);

  return {
    isListening,
    activeItemId,
    supported,
    startListening,
    stopListening,
  };
}
