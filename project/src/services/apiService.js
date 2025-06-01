import { HfInference } from '@huggingface/inference';

const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
console.log('HF Token available:', !!HF_TOKEN);

const hf = new HfInference(HF_TOKEN);

export const correctSentence = async (sentence) => {
  try {
    console.log('Original sentence:', sentence);
    
    // First apply basic corrections
    let correctedText = sentence;
    
    // Basic grammar correction rules
    const corrections = [
      // Capitalization
      [/\bi am\b/gi, 'I am'],
      [/\bi've\b/gi, 'I\'ve'],
      [/\bi'll\b/gi, 'I\'ll'],
      [/\bi'd\b/gi, 'I\'d'],
      [/\bi\b/gi, 'I'],
      
      // Common contractions
      [/dont/gi, "don't"],
      [/cant/gi, "can't"],
      [/wont/gi, "won't"],
      [/aint/gi, "ain't"],
      [/didnt/gi, "didn't"],
      [/isnt/gi, "isn't"],
      [/wouldnt/gi, "wouldn't"],
      [/couldnt/gi, "couldn't"],
      [/shouldnt/gi, "shouldn't"],
      
      // Common grammar mistakes
      [/its a/gi, "it's a"],
      [/there is/gi, "there is"],
      [/their is/gi, "there is"],
      [/they're is/gi, "there is"],
      
      // Your vs You're corrections
      [/\byour\s+(going|coming|doing|trying|working|studying|learning|teaching|playing|running|walking|talking|thinking|feeling|looking|waiting|standing|sitting|lying|sleeping|waking|eating|drinking|reading|writing|speaking|listening|watching|seeing|hearing|smelling|tasting|touching|moving|staying|leaving|arriving|starting|finishing|beginning|ending|stopping|continuing|changing|growing|developing|improving|getting|becoming|seeming|appearing|remaining|staying|keeping|holding|carrying|bringing|taking|giving|sending|receiving|buying|selling|paying|spending|saving|earning|losing|winning|failing|succeeding|passing|failing|breaking|fixing|building|creating|making|doing|having|being)\b/gi, 'you\'re $1'],
      [/\byour\s+(a|an|the)\s+[a-z]+\b/gi, 'you\'re $1'],
      [/\byour\s+(not|n't)\b/gi, 'you\'re $1'],
      [/\byour\s+(going to|gonna)\b/gi, 'you\'re $1'],
      [/\byour\s+(able to|gonna|wanna|gotta)\b/gi, 'you\'re $1'],
      
      // Common spelling mistakes
      [/loose/gi, "lose"],
      [/definately/gi, "definitely"],
      [/alot/gi, "a lot"],
      [/seperate/gi, "separate"],
      [/recieve/gi, "receive"],
      [/untill/gi, "until"],
      
      // Spacing and punctuation
      [/\s{2,}/g, ' '],
      [/\s+([.,!?])/g, '$1'],
      [/([a-z])([A-Z])/g, '$1 $2']
    ];

    // Apply basic corrections
    corrections.forEach(([pattern, replacement]) => {
      correctedText = correctedText.replace(pattern, replacement);
    });
    
    // Fix article usage (a vs an)
    correctedText = correctedText.replace(/\b(a)\s+([aeiouAEIOU])/g, 'an $2');
    
    // Capitalize first letter
    if (correctedText.length > 0) {
      correctedText = correctedText.charAt(0).toUpperCase() + correctedText.slice(1);
    }
    
    // Add period if missing
    if (correctedText.length > 0 && !correctedText.match(/[.!?]$/)) {
      correctedText += '.';
    }

    console.log('After basic corrections:', correctedText);

    // Now use Hugging Face model for advanced grammar correction
    try {
      console.log('Attempting to call Hugging Face API...');
      
      const response = await fetch(
        'https://api-inference.huggingface.co/models/oliverguhr/fullstop-punctuation-multilang-large',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: correctedText,
            options: {
              use_cache: false,
              wait_for_model: true
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Hugging Face API response:', result);

      // Handle the response based on the token classification format
      let corrected = '';
      if (Array.isArray(result)) {
        // The model returns an array of tokens with their punctuation predictions
        corrected = result.map(token => token.word + (token.punctuation || '')).join(' ');
      } else {
        corrected = correctedText;
      }

      return corrected.trim();
    } catch (error) {
      console.error('Error with Hugging Face model:', error);
      return correctedText;
    }
  } catch (error) {
    console.error('Error in correction:', error);
    return sentence;
  }
};
