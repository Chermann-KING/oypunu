import { Definition } from './definition';

export interface Meaning {
  id: string;
  wordId: string;
  partOfSpeech: string; // noun, verb, adjective, etc.
  definitions?: Definition[];
  synonyms?: string[];
  antonyms?: string[];
  examples?: string[];
}
