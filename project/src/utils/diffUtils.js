import { diffWords } from 'diff';

export const generateDiff = (original, corrected) => {
  return diffWords(original, corrected);
};
