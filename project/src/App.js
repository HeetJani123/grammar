import React, { useState } from 'react';
import { correctSentence } from './services/apiService';
import SpeechToText from './components/SpeechToText';
import { generateDiff } from './utils/diffUtils';

function App() {
  const [input, setInput] = useState('');
  const [corrected, setCorrected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diff, setDiff] = useState([]);

  const handleCorrection = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await correctSentence(input);
      setCorrected(result);
      setDiff(generateDiff(input, result));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechInput = (transcript) => {
    setInput(transcript);
  };

  const styles = {
    app: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    },
    h1: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '2rem'
    },
    inputSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '2rem'
    },
    textarea: {
      width: '100%',
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '1rem',
      resize: 'vertical'
    },
    button: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.3s'
    },
    error: {
      color: '#f44336',
      padding: '1rem',
      margin: '1rem 0',
      backgroundColor: '#ffebee',
      borderRadius: '4px'
    },
    result: {
      padding: '1rem',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px'
    },
    resultH2: {
      color: '#333',
      marginBottom: '0.5rem'
    },
    resultP: {
      margin: 0,
      lineHeight: 1.5
    },
    diffContainer: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    removed: {
      backgroundColor: '#ffcdd2',
      color: '#d32f2f',
      textDecoration: 'line-through',
      padding: '0 2px',
      margin: '0 2px',
      borderRadius: '2px'
    },
    added: {
      backgroundColor: '#c8e6c9',
      color: '#2e7d32',
      padding: '0 2px',
      margin: '0 2px',
      borderRadius: '2px'
    },
    unchanged: {
      color: '#333'
    }
  };

  const renderDiff = () => {
    return diff.map((part, index) => {
      const style = part.added ? styles.added : 
                   part.removed ? styles.removed : 
                   styles.unchanged;
      return React.createElement('span', 
        { 
          key: index,
          style: style
        }, 
        part.value
      );
    });
  };

  return React.createElement('div', { style: styles.app },
    React.createElement('h1', { style: styles.h1 }, 'Grammar Corrector'),
    
    React.createElement('div', { style: styles.inputSection },
      React.createElement('textarea', {
        value: input,
        onChange: (e) => setInput(e.target.value),
        placeholder: 'Enter text to correct...',
        rows: 4,
        style: styles.textarea
      }),
      
      React.createElement(SpeechToText, { onTextReceived: handleSpeechInput }),
      
      React.createElement('button', {
        onClick: handleCorrection,
        disabled: loading || !input.trim(),
        style: styles.button
      }, loading ? 'Correcting...' : 'Correct Grammar')
    ),

    error && React.createElement('div', { style: styles.error }, error),

    corrected && React.createElement('div', { style: styles.result },
      React.createElement('h2', { style: styles.resultH2 }, 'Corrected Text:'),
      React.createElement('div', { style: styles.diffContainer },
        renderDiff()
      )
    )
  );
}

export default App; 