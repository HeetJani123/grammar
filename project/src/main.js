import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import { correctSentence } from './services/apiService';
import { generateDiff } from './utils/diffUtils';

// Create and render the app structure
function createAppStructure() {
  const appContainer = document.createElement('div');
  appContainer.id = 'app';

  // Create header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1>AI Sentence Corrector</h1>
  `;

  // Create main content
  const main = document.createElement('main');

  // Create correction panel
  const correctionPanel = document.createElement('div');
  correctionPanel.className = 'correction-panel';
  correctionPanel.innerHTML = `
    <div class="input-group">
      <label for="sentence-input">Enter a sentence to correct</label>
      <textarea 
        id="sentence-input" 
        placeholder="Type a sentence with grammar mistakes..."
      ></textarea>
    </div>
    <button id="correct-btn" class="primary-btn">
      <span class="btn-text">Correct Sentence</span>
      <span class="loading-spinner hidden"></span>
    </button>
  `;

  // Create result panel
  const resultPanel = document.createElement('div');
  resultPanel.id = 'result-panel';
  resultPanel.className = 'hidden';
  resultPanel.innerHTML = `
    <h3>Corrected Text</h3>
    <div id="diff-display" class="diff-content"></div>
  `;

  // Assemble the app
  main.appendChild(correctionPanel);
  main.appendChild(resultPanel);
  appContainer.appendChild(header);
  appContainer.appendChild(main);

  return appContainer;
}

// Initialize the app
// (revert to plain JS event listeners and DOM manipulation)
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const app = createAppStructure();
    rootElement.appendChild(app);

    // Set up event listeners
    const elements = {
      input: document.getElementById('sentence-input'),
      correctBtn: document.getElementById('correct-btn'),
      resultPanel: document.getElementById('result-panel'),
      diffDisplay: document.getElementById('diff-display'),
      btnText: document.querySelector('.btn-text'),
      loadingSpinner: document.querySelector('.loading-spinner')
    };

    async function handleCorrection() {
      const text = elements.input.value.trim();
      if (!text) {
        alert('Please enter some text to correct');
        return;
      }

      // Show loading state
      elements.correctBtn.disabled = true;
      elements.btnText.textContent = 'Correcting...';
      elements.loadingSpinner.classList.remove('hidden');

      try {
        const correctedText = await correctSentence(text);
        const diff = generateDiff(text, correctedText);
        
        elements.diffDisplay.innerHTML = diff.map(part => {
          if (part.added) {
            return `<span class="highlight-added">${part.value}</span>`;
          }
          if (part.removed) {
            return `<span class="highlight-removed">${part.value}</span>`;
          }
          return part.value;
        }).join('');

        elements.resultPanel.classList.remove('hidden');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to correct the sentence. Please try again.');
      } finally {
        // Reset button state
        elements.correctBtn.disabled = false;
        elements.btnText.textContent = 'Correct Sentence';
        elements.loadingSpinner.classList.add('hidden');
      }
    }

    // Add event listener
    if (elements.correctBtn) {
      elements.correctBtn.addEventListener('click', handleCorrection);
    }
  }
});

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));