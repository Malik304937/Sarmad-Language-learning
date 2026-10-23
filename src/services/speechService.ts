// Speech Service utilizing the standard Web Speech API for TTS and SpeechRecognition

// Speak text in the target language using window.speechSynthesis
export function speakText(text: string, voiceCode: string = 'en-US'): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceCode;
      utterance.rate = 0.9; // Slightly slower for language learners
      utterance.pitch = 1.0;

      // Try to find a matching voice for the target language
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = voiceCode.split('-')[0].toLowerCase();
        const matchedVoice =
          voices.find((v) => v.lang.toLowerCase() === voiceCode.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        resolve(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Failed to speak text:', e);
      resolve(false);
    }
  });
}

// Interface for speech recognition results
export interface SpeechRecognitionResultState {
  transcript: string;
  isFinal: boolean;
}

// Start voice recognition using SpeechRecognition / webkitSpeechRecognition
export function createSpeechRecognizer(
  langCode: string = 'en-US',
  onResult: (transcript: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): { start: () => void; stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) {
    return null;
  }

  try {
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langCode;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      let errorMsg = 'Could not access microphone.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please try speaking closer to the microphone.';
      } else if (event.error === 'network') {
        errorMsg = 'Network error occurred during speech recognition.';
      }
      onError(errorMsg);
    };

    recognition.onend = () => {
      onEnd();
    };

    return {
      start: () => {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Recognition already started or error:', e);
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
    };
  } catch (err: any) {
    console.warn('Could not construct speech recognizer:', err);
    return null;
  }
}
