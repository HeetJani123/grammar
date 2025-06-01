import React, { useState, useEffect } from 'react';

const SpeechToText = ({ onTextReceived }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser.');
    }
  }, []);

  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTextReceived(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        setError(`Error occurred in recognition: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setError(`Error starting speech recognition: ${err.message}`);
    }
  };

  const styles = {
    container: {
      margin: '1rem 0',
      textAlign: 'center'
    },
    button: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: isListening ? '#f44336' : '#4CAF50',
      color: 'white',
      cursor: isListening ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s',
      animation: isListening ? 'pulse 1.5s infinite' : 'none'
    },
    error: {
      color: '#f44336',
      marginTop: '0.5rem'
    }
  };

  return React.createElement('div', { className: 'speech-to-text', style: styles.container },
    React.createElement('button', {
      onClick: startListening,
      disabled: isListening,
      style: styles.button
    }, isListening ? 'Listening...' : 'Start Speaking'),
    error && React.createElement('p', { style: styles.error }, error)
  );
};

export default SpeechToText; 
