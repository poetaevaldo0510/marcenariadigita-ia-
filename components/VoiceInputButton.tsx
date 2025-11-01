import React, { useState, useEffect, useRef } from 'react';
import { MicIcon } from './Shared';

interface VoiceInputButtonProps {
  onRecordingStart: () => void;
  onTranscriptUpdate: (text: string, isFinal: boolean) => void;
  showAlert: (message: string, title?: string) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onRecordingStart, onTranscriptUpdate, showAlert }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    
    recognition.onresult = (event: any) => {
      let fullTranscriptForSession = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscriptForSession += event.results[i][0].transcript;
      }
      // This sends the complete, self-correcting text for the entire session
      onTranscriptUpdate(fullTranscriptForSession, false); 
    };

    recognition.onspeechstart = () => setIsSpeaking(true);
    recognition.onspeechend = () => setIsSpeaking(false);

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
      setIsRecording(false);
      setIsSpeaking(false);
      // Signal to parent component that speech has ended and state can be finalized.
      onTranscriptUpdate('', true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      let errorMessage = `Erro no reconhecimento de voz: ${event.error}`;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMessage = "A permissão para usar o microfone foi negada. Verifique as configurações do seu navegador.";
      } else if (event.error === 'no-speech') {
        errorMessage = "Nenhuma fala foi detectada. Tente falar mais perto do microfone.";
      }
      showAlert(errorMessage, "Erro de Gravação");
      setIsRecording(false);
      setIsSpeaking(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscriptUpdate, showAlert]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      showAlert("O reconhecimento de voz não é suportado pelo seu navegador.", "Funcionalidade Indisponível");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        onRecordingStart();
        recognitionRef.current.start();
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'InvalidStateError')) {
           console.error("Could not start speech recognition:", error);
           showAlert("Não foi possível iniciar a gravação. Tente novamente.", "Erro");
        }
      }
    }
  };

  const isSupported = !!recognitionRef.current;

  return (
    <button
      type="button"
      onClick={handleToggleRecording}
      disabled={!isSupported}
      className={`p-2 rounded-full transition-colors duration-300 flex items-center justify-center ${
        isRecording
          ? 'bg-red-500 animate-pulse-scale'
          : 'bg-[#e6ddcd] dark:bg-[#4a4040] hover:bg-[#dcd6c8] dark:hover:bg-[#5a4f4f]'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={!isSupported ? "Reconhecimento de voz não suportado" : (isRecording ? 'Parar gravação' : 'Gravar descrição por voz')}
    >
      <MicIcon isRecording={isRecording} isSpeaking={isSpeaking} />
    </button>
  );
};