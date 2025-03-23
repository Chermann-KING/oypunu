import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FeaturedWord {
  id: string;
  word: string;
  language: string;
  languageCode: string;
  partOfSpeech: string;
  definition: string;
  isFavorite: boolean;
}

export interface SiteStatistics {
  activeUsers: number;
  definedWords: number;
  languages: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomeDataService {
  private _featuredWords: FeaturedWord[] = [
    {
      id: '1',
      word: 'Sérénité',
      language: 'Français',
      languageCode: 'fr',
      partOfSpeech: 'Nom',
      definition:
        'État de calme, de tranquillité, de confiance sur le plan moral.',
      isFavorite: false,
    },
    {
      id: '2',
      word: 'Wanderlust',
      language: 'Deutsch',
      languageCode: 'de',
      partOfSpeech: 'Name',
      definition: 'Ein starkes Verlangen zu reisen und die Welt zu erkunden.',
      isFavorite: true,
    },
    {
      id: '3',
      word: 'Hygge',
      language: 'Dansk',
      languageCode: 'da',
      partOfSpeech: 'Navn',
      definition:
        'En kvalitet af komfort og hygge, der fremkalder en følelse af velvære.',
      isFavorite: false,
    },
  ];

  private _statistics: SiteStatistics = {
    activeUsers: 250000,
    definedWords: 1000000,
    languages: 50,
  };

  constructor() {}

  getFeaturedWords(): Observable<FeaturedWord[]> {
    return of(this._featuredWords);
  }

  getStatistics(): Observable<SiteStatistics> {
    return of(this._statistics);
  }

  toggleFavorite(wordId: string): void {
    const wordIndex = this._featuredWords.findIndex(
      (word) => word.id === wordId
    );
    if (wordIndex !== -1) {
      this._featuredWords[wordIndex].isFavorite =
        !this._featuredWords[wordIndex].isFavorite;
    }
  }
}
