import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Word } from '../../../../core/models/word';

@Component({
  selector: 'app-word-card',
  standalone: false,
  templateUrl: './word-card.component.html',
  styleUrls: ['./word-card.component.scss'],
})
export class WordCardComponent {
  @Input() word!: Word;
  @Input() showLanguage = true;
  @Input() showDefinition = true;

  @Output() favoriteToggle = new EventEmitter<void>();

  // Options pour les langages
  languages = {
    fr: 'Français',
    en: 'Anglais',
    es: 'Espagnol',
    de: 'Allemand',
    it: 'Italien',
    pt: 'Portugais',
    ru: 'Russe',
    ja: 'Japonais',
    zh: 'Chinois',
  };

  // Options pour les parties du discours
  partsOfSpeech = {
    noun: 'Nom',
    verb: 'Verbe',
    adjective: 'Adjectif',
    adverb: 'Adverbe',
    pronoun: 'Pronom',
    preposition: 'Préposition',
    conjunction: 'Conjonction',
    interjection: 'Interjection',
  };

  constructor() {}

  getLanguageName(code: string): string {
    return this.languages[code as keyof typeof this.languages] || code;
  }

  getPartOfSpeechName(code: string): string {
    return this.partsOfSpeech[code as keyof typeof this.partsOfSpeech] || code;
  }

  onFavoriteClick(): void {
    this.favoriteToggle.emit();
  }

  getFirstDefinition(): string | null {
    if (
      this.word.meanings &&
      this.word.meanings.length > 0 &&
      this.word.meanings[0].definitions &&
      this.word.meanings[0].definitions.length > 0
    ) {
      return this.word.meanings[0].definitions[0].definition;
    }
    return null;
  }

  getFirstPartOfSpeech(): string | null {
    if (this.word.meanings && this.word.meanings.length > 0) {
      return this.word.meanings[0].partOfSpeech;
    }
    return null;
  }
}
