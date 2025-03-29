import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DictionaryRoutingModule } from './dictionary-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

import { SearchComponent } from './components/search/search.component';
import { WordDetailsComponent } from './components/word-details/word-details.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { FavoriteWordsComponent } from './components/favorite-words/favorite-words.component';
import { WordCardComponent } from './components/word-card/word-card.component';
import { AddWordComponent } from './components/add-word/add-word.component';

@NgModule({
  declarations: [
    SearchComponent,
    WordDetailsComponent,
    SearchResultsComponent,
    FavoriteWordsComponent,
    WordCardComponent,
    AddWordComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DictionaryRoutingModule,
    SharedModule,
    RouterModule,
  ],
  exports: [
    SearchComponent,
    WordDetailsComponent,
    WordCardComponent,
    SearchResultsComponent,
  ],
})
export class DictionaryModule {}
