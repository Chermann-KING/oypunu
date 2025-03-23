import { Component, OnInit } from '@angular/core';
import {
  HomeDataService,
  FeaturedWord,
  SiteStatistics,
} from '../../services/home-data.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  featuredWords: FeaturedWord[] = [];
  statistics: SiteStatistics | null = null;
  searchQuery: string = '';

  constructor(private _homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.loadFeaturedWords();
    this.loadStatistics();
  }

  loadFeaturedWords(): void {
    this._homeDataService.getFeaturedWords().subscribe((words) => {
      this.featuredWords = words;
    });
  }

  loadStatistics(): void {
    this._homeDataService.getStatistics().subscribe((stats) => {
      this.statistics = stats;
    });
  }

  toggleFavorite(wordId: string): void {
    this._homeDataService.toggleFavorite(wordId);
    // Recharge les mots pour refléter le changement
    this.loadFeaturedWords();
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toString();
  }
}
