import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      // Chrome loads voices asynchronously, so we hook into the event if available
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {};
      }
    }
  }, []);

  const speak = (text: string) => {
    if (!supported) return;

    // Cancel current speaking processes
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a gentle/natural English voice
    const voices = window.speechSynthesis.getVoices();
    const calmVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Hazel'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (calmVoice) {
      utterance.voice = calmVoice;
    }
    
    utterance.rate = 0.85;  // Slower, predictable pace for easy comprehension
    utterance.pitch = 1.05; // Slightly friendly pitch

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking, supported };
};
