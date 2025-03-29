import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DictionaryService } from '../../../../core/services/dictionary.service';
import { Word } from '../../../../core/models/word';

@Component({
  selector: 'app-favorite-words',
  standalone: false,
  templateUrl: './favorite-words.component.html',
  styleUrls: ['./favorite-words.component.scss'],
})
export class FavoriteWordsComponent implements OnInit, OnDestroy {
  favoriteWords: Word[] = [];
  isLoading = true;
  errorMessage = '';

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

  private _destroy$ = new Subject<void>();

  constructor(private _dictionaryService: DictionaryService) {}

  ngOnInit(): void {
    this.loadFavoriteWords();

    // S'abonner aux changements de favoris
    this._dictionaryService.favoriteWords$
      .pipe(takeUntil(this._destroy$))
      .subscribe((words) => {
        this.favoriteWords = words;
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadFavoriteWords(): void {
    this.isLoading = true;
    this._dictionaryService
      .getFavoriteWords()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (words) => {
          this.favoriteWords = words;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading favorite words:', error);
          this.errorMessage =
            'Une erreur est survenue lors du chargement de vos mots favoris';
          this.isLoading = false;
        },
      });
  }

  removeFromFavorites(word: Word): void {
    this._dictionaryService
      .removeFromFavorites(word.id)
      .pipe(takeUntil(this._destroy$))
      .subscribe((response) => {
        if (response.success) {
          // Mise à jour de la liste est gérée via l'observable favoriteWords$
        }
      });
  }

  getLanguageName(code: string): string {
    return this.languages[code as keyof typeof this.languages] || code;
  }

  getPartOfSpeechName(code: string): string {
    return this.partsOfSpeech[code as keyof typeof this.partsOfSpeech] || code;
  }
}
