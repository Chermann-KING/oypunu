import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Word } from '../models/word';
import { SearchParams } from '../models/search-params';
import { SearchResults } from '../models/search-results';
import { Category } from '../models/category';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private readonly _API_URL = `${environment.apiUrl}/dictionary`;
  private _recentSearches: BehaviorSubject<string[]> = new BehaviorSubject<
    string[]
  >([]);
  private _favoriteWords: BehaviorSubject<Word[]> = new BehaviorSubject<Word[]>(
    []
  );

  recentSearches$ = this._recentSearches.asObservable();
  favoriteWords$ = this._favoriteWords.asObservable();

  constructor(private _http: HttpClient, private _authService: AuthService) {
    this._loadRecentSearches();
    this._loadFavoriteWords();
  }

  // Recherche de mots
  searchWords(params: SearchParams): Observable<SearchResults> {
    let httpParams = new HttpParams()
      .set('query', params.query)
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.languages && params.languages.length) {
      httpParams = httpParams.set('languages', params.languages.join(','));
    }

    if (params.categories && params.categories.length) {
      httpParams = httpParams.set('categories', params.categories.join(','));
    }

    if (params.partsOfSpeech && params.partsOfSpeech.length) {
      httpParams = httpParams.set(
        'partsOfSpeech',
        params.partsOfSpeech.join(',')
      );
    }

    if (params.query.trim() !== '') {
      this._addToRecentSearches(params.query);
    }

    return this._http
      .get<SearchResults>(`${this._API_URL}/search`, { params: httpParams })
      .pipe(
        map((results) => ({
          ...results,
          words: results.words.map((word) => this._checkIfFavorite(word)),
        })),
        catchError((error) => {
          console.error('Error searching words:', error);
          return of({
            words: [],
            total: 0,
            page: params.page,
            limit: params.limit,
            totalPages: 0,
          });
        })
      );
  }

  // Obtenir un mot par ID
  getWordById(id: string): Observable<Word | null> {
    return this._http.get<Word>(`${this._API_URL}/words/${id}`).pipe(
      map((word) => this._checkIfFavorite(word)),
      catchError((error) => {
        console.error(`Error fetching word with ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Obtenir les mots récemment ajoutés ou populaires
  getFeaturedWords(limit: number = 10): Observable<Word[]> {
    return this._http
      .get<Word[]>(`${this._API_URL}/featured?limit=${limit}`)
      .pipe(
        map((words) => words.map((word) => this._checkIfFavorite(word))),
        catchError((error) => {
          console.error('Error fetching featured words:', error);
          return of([]);
        })
      );
  }

  // Obtenir les catégories disponibles
  getCategories(language?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (language) {
      params = params.set('language', language);
    }

    return this._http
      .get<Category[]>(`${this._API_URL}/categories`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching categories:', error);
          return of([]);
        })
      );
  }

  // Ajouter un mot aux favoris
  addToFavorites(wordId: string): Observable<{ success: boolean }> {
    if (!this._authService.isAuthenticated()) {
      return of({ success: false });
    }

    return this._http
      .post<{ success: boolean }>(`${this._API_URL}/favorites`, { wordId })
      .pipe(
        tap((response) => {
          if (response.success) {
            this._updateFavoriteStatus(wordId, true);
          }
        }),
        catchError((error) => {
          console.error(`Error adding word ${wordId} to favorites:`, error);
          return of({ success: false });
        })
      );
  }

  // Supprimer un mot des favoris
  removeFromFavorites(wordId: string): Observable<{ success: boolean }> {
    if (!this._authService.isAuthenticated()) {
      return of({ success: false });
    }

    return this._http
      .delete<{ success: boolean }>(`${this._API_URL}/favorites/${wordId}`)
      .pipe(
        tap((response) => {
          if (response.success) {
            this._updateFavoriteStatus(wordId, false);
          }
        }),
        catchError((error) => {
          console.error(`Error removing word ${wordId} from favorites:`, error);
          return of({ success: false });
        })
      );
  }

  // Obtenir les mots favoris de l'utilisateur
  getFavoriteWords(): Observable<Word[]> {
    if (!this._authService.isAuthenticated()) {
      return of([]);
    }

    return this._http.get<Word[]>(`${this._API_URL}/favorites`).pipe(
      tap((words) => {
        const favoritesWithFlag = words.map((word) => ({
          ...word,
          isFavorite: true,
        }));
        this._favoriteWords.next(favoritesWithFlag);
      }),
      catchError((error) => {
        console.error('Error fetching favorite words:', error);
        return of([]);
      })
    );
  }

  // Soumettre un nouveau mot
  submitWord(wordData: Partial<Word>): Observable<Word | null> {
    if (!this._authService.isAuthenticated()) {
      return of(null);
    }

    return this._http.post<Word>(`${this._API_URL}/words`, wordData).pipe(
      catchError((error) => {
        console.error('Error submitting new word:', error);
        return of(null);
      })
    );
  }

  // Méthodes privées pour gérer les recherches récentes et les favoris
  private _loadRecentSearches(): void {
    try {
      const storedSearches = localStorage.getItem('recentSearches');
      if (storedSearches) {
        this._recentSearches.next(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches from localStorage:', error);
    }
  }

  private _addToRecentSearches(query: string): void {
    try {
      const currentSearches = this._recentSearches.value;
      // Éviter les doublons et limiter à 10 recherches récentes
      const updatedSearches = [
        query,
        ...currentSearches.filter((s) => s !== query),
      ].slice(0, 10);
      this._recentSearches.next(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error adding to recent searches:', error);
    }
  }

  private _loadFavoriteWords(): void {
    // Charger les favoris si l'utilisateur est connecté
    if (this._authService.isAuthenticated()) {
      this.getFavoriteWords().subscribe();
    }

    // S'abonner aux changements d'état d'authentification
    this._authService.currentUser$.subscribe((user) => {
      if (user) {
        this.getFavoriteWords().subscribe();
      } else {
        this._favoriteWords.next([]);
      }
    });
  }

  private _updateFavoriteStatus(wordId: string, isFavorite: boolean): void {
    const currentFavorites = this._favoriteWords.value;

    if (isFavorite) {
      // Chercher si le mot existe déjà dans les favoris
      const existingFavorite = currentFavorites.find((w) => w.id === wordId);
      if (!existingFavorite) {
        // Si le mot n'est pas dans les favoris, on doit le récupérer
        this.getWordById(wordId).subscribe((word) => {
          if (word) {
            this._favoriteWords.next([
              ...currentFavorites,
              { ...word, isFavorite: true },
            ]);
          }
        });
      }
    } else {
      // Supprimer le mot des favoris
      const updatedFavorites = currentFavorites.filter((w) => w.id !== wordId);
      this._favoriteWords.next(updatedFavorites);
    }
  }

  private _checkIfFavorite(word: Word): Word {
    const favorites = this._favoriteWords.value;
    return {
      ...word,
      isFavorite: favorites.some((f) => f.id === word.id),
    };
  }
}
