// backend/src/dictionary/dto/create-word.dto.ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class DefinitionDto {
  @IsString()
  @IsNotEmpty()
  definition: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  examples?: string[];

  @IsString()
  @IsOptional()
  sourceUrl?: string;
}

class MeaningDto {
  @IsString()
  @IsNotEmpty()
  partOfSpeech: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefinitionDto)
  definitions: DefinitionDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  antonyms?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  examples?: string[];
}

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsOptional()
  pronunciation?: string;

  @IsString()
  @IsOptional()
  etymology?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MeaningDto)
  meanings: MeaningDto[];

  @IsString()
  @IsOptional()
  status?: 'approved' | 'pending' | 'rejected';
}
