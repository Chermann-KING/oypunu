import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Word, WordDocument } from '../schemas/word.schema';
import {
  FavoriteWord,
  FavoriteWordDocument,
} from '../schemas/favorite-word.schema';
import { CreateWordDto } from '../dto/create-word.dto';
import { UpdateWordDto } from '../dto/update-word.dto';
import { SearchWordsDto } from '../dto/search-words.dto';
import { User } from '../../users/schemas/user.schema';

interface WordFilter {
  status: string;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  language?: { $in: string[] };
  categoryId?: { $in: Types.ObjectId[] };
  'meanings.partOfSpeech'?: { $in: string[] };
}

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private wordModel: Model<WordDocument>,
    @InjectModel(FavoriteWord.name)
    private favoriteWordModel: Model<FavoriteWordDocument>,
  ) {}

  async create(createWordDto: CreateWordDto, user: User): Promise<Word> {
    if (!user?._id) {
      throw new BadRequestException('Utilisateur invalide');
    }

    // Vérifier si le mot existe déjà dans la même langue
    const existingWord = await this.wordModel.findOne({
      word: createWordDto.word,
      language: createWordDto.language,
    });

    if (existingWord) {
      throw new BadRequestException(
        `Le mot "${createWordDto.word}" existe déjà dans la langue ${createWordDto.language}`,
      );
    }

    // Créer le nouveau mot
    const createdWord = new this.wordModel({
      ...createWordDto,
      createdBy: Types.ObjectId.isValid(String(user._id))
        ? new Types.ObjectId(String(user._id))
        : new Types.ObjectId(),
      status: user.role === 'admin' ? 'approved' : 'pending',
    });

    return createdWord.save();
  }

  async findAll(
    page = 1,
    limit = 10,
    status = 'approved',
  ): Promise<{
    words: Word[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await this.wordModel.countDocuments({ status });
    const words = await this.wordModel
      .find({ status })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return {
      words,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Word> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de mot invalide');
    }

    const word = await this.wordModel
      .findById(id)
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .exec();

    if (!word) {
      throw new NotFoundException(`Mot avec l'ID ${id} non trouvé`);
    }

    return word;
  }

  async update(
    id: string,
    updateWordDto: UpdateWordDto,
    user: User,
  ): Promise<Word> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de mot invalide');
    }

    const word = await this.wordModel.findById(id);

    if (!word) {
      throw new NotFoundException(`Mot avec l'ID ${id} non trouvé`);
    }

    // Vérifier si l'utilisateur a le droit de modifier ce mot
    if (
      user.role !== 'admin' &&
      word.createdBy &&
      typeof word.createdBy === 'object' &&
      '_id' in word.createdBy &&
      word.createdBy._id &&
      Types.ObjectId.isValid(String(word.createdBy._id)) &&
      Types.ObjectId.isValid(String(user._id)) &&
      String(word.createdBy._id) !== String(user._id)
    ) {
      throw new BadRequestException(
        "Vous n'avez pas le droit de modifier ce mot",
      );
    }

    // Si le statut du mot a été modifié et que l'utilisateur n'est pas admin
    if (updateWordDto.status && user.role !== 'admin') {
      delete updateWordDto.status;
    }

    const updatedWord = await this.wordModel
      .findByIdAndUpdate(id, updateWordDto, { new: true })
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .exec();

    if (!updatedWord) {
      throw new NotFoundException(`Mot avec l'ID ${id} non trouvé`);
    }

    return updatedWord;
  }

  async remove(id: string, user: User): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de mot invalide');
    }

    const word = await this.wordModel.findById(id);

    if (!word) {
      throw new NotFoundException(`Mot avec l'ID ${id} non trouvé`);
    }

    // Vérifier si l'utilisateur a le droit de supprimer ce mot
    const isAdmin = user.role === 'admin';

    // Fonction pour extraire et comparer les IDs de manière sûre
    const compareIds = (id1: any, id2: any): boolean => {
      return String(id1) === String(id2);
    };

    let isCreator = false;
    if (
      word.createdBy &&
      typeof word.createdBy === 'object' &&
      'id' in word.createdBy &&
      user._id
    ) {
      isCreator = compareIds(word.createdBy._id, user._id);
    }

    if (!isAdmin && !isCreator) {
      throw new BadRequestException(
        "Vous n'avez pas le droit de supprimer ce mot",
      );
    }

    await this.wordModel.findByIdAndDelete(id);
    // Supprimer également les favoris associés à ce mot
    await this.favoriteWordModel.deleteMany({ wordId: id });

    return { success: true };
  }

  async search(searchDto: SearchWordsDto): Promise<{
    words: Word[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      query,
      languages,
      categories,
      partsOfSpeech,
      page = 1,
      limit = 10,
    } = searchDto;
    const skip = (page - 1) * limit;

    // Construire les filtres de recherche
    const filter: WordFilter = {
      status: 'approved',
    };

    // Recherche par texte
    if (query && query.trim() !== '') {
      filter.$or = [
        { word: { $regex: query, $options: 'i' } },
        { 'meanings.definitions.definition': { $regex: query, $options: 'i' } },
      ];
    }

    // Filtrer par langue
    if (languages && languages.length > 0) {
      filter.language = { $in: languages };
    }

    // Filtrer par catégorie
    if (categories && categories.length > 0) {
      filter.categoryId = {
        $in: categories.map((id) => new Types.ObjectId(id)),
      };
    }

    // Filtrer par partie du discours
    if (partsOfSpeech && partsOfSpeech.length > 0) {
      filter['meanings.partOfSpeech'] = { $in: partsOfSpeech };
    }

    // Exécuter la requête
    const total = await this.wordModel.countDocuments(filter);
    const words = await this.wordModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .exec();

    return {
      words,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFeaturedWords(limit = 6): Promise<Word[]> {
    // Obtenir des mots approuvés aléatoires pour la page d'accueil
    return this.wordModel
      .find({ status: 'approved' })
      .limit(limit)
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async addToFavorites(
    wordId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(wordId)) {
      throw new BadRequestException('ID de mot invalide');
    }

    // Vérifier si le mot existe
    const word = await this.wordModel.findById(wordId);
    if (!word) {
      throw new NotFoundException(`Mot avec l'ID ${wordId} non trouvé`);
    }

    // Vérifier si le mot est déjà dans les favoris
    const existingFavorite = await this.favoriteWordModel.findOne({
      wordId,
      userId,
    });

    if (existingFavorite) {
      return { success: true }; // Déjà dans les favoris
    }

    // Ajouter aux favoris
    const newFavorite = new this.favoriteWordModel({
      wordId,
      userId,
      addedAt: new Date(),
    });

    await newFavorite.save();
    return { success: true };
  }

  async removeFromFavorites(
    wordId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    if (!Types.ObjectId.isValid(wordId)) {
      throw new BadRequestException('ID de mot invalide');
    }

    // Supprimer des favoris
    const result = await this.favoriteWordModel.deleteOne({
      wordId,
      userId,
    });

    return { success: result.deletedCount > 0 };
  }

  async getFavoriteWords(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    words: Word[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Trouver tous les IDs des mots favoris de l'utilisateur
    const favorites = await this.favoriteWordModel
      .find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ addedAt: -1 })
      .exec();

    const wordIds = favorites.map((fav) => fav.wordId);
    const total = await this.favoriteWordModel.countDocuments({ userId });

    // Si aucun favori, retourner un tableau vide
    if (wordIds.length === 0) {
      return {
        words: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Récupérer les mots correspondants
    const words = await this.wordModel
      .find({ _id: { $in: wordIds } })
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .exec();

    // Fonction pour comparer les IDs MongoDB de manière sûre
    const compareIds = (id1: any, id2: any): boolean => {
      return String(id1) === String(id2);
    };

    // Réordonner les mots dans le même ordre que les favoris
    const orderedWords = [] as Word[];

    for (const id of wordIds) {
      let found = false;
      for (const word of words) {
        if (!found && word && word._id && compareIds(word._id, id)) {
          orderedWords.push(word as unknown as Word);
          found = true;
        }
      }
    }

    return {
      words: orderedWords,
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkIfFavorite(wordId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(wordId)) {
      return false;
    }

    const favorite = await this.favoriteWordModel.findOne({
      wordId,
      userId,
    });

    return !!favorite;
  }

  async getAdminPendingWords(
    page = 1,
    limit = 10,
  ): Promise<{
    words: Word[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await this.wordModel.countDocuments({ status: 'pending' });
    const words = await this.wordModel
      .find({ status: 'pending' })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return {
      words,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateWordStatus(
    id: string,
    status: 'approved' | 'rejected',
  ): Promise<Word> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de mot invalide');
    }

    const word = await this.wordModel.findById(id);
    if (!word) {
      throw new NotFoundException(`Mot avec l'ID ${id} non trouvé`);
    }

    word.status = status;
    return word.save();
  }
}
