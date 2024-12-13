import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { LimitlessDto } from '../dto/limitless.dto';
import { Limitless } from '../entities/limitless.entity';
import { DreamDto } from '../dto/dream.dto';
import { Dream } from '../entities/dream.entity';
import { Lesson } from '../entities/lesson.entity';
import { LessonDto } from '../dto/lesson.dto';
import { Affirmation } from '../entities/affirmation.entity';
import { AffirmationDto } from '../dto/affirmation.dto';
import { Gratitude } from '../entities/gratitude.entity';
import { GratitudeDto } from '../dto/gratitude.dto';
import { EmotionDto } from '../dto/emotion.dto';
import { Emotion } from '../entities/emotion.entity';
import { Journey } from '../entities/journey.entity';
import { JourneyDto } from '../dto/journey.dto';
import { LimitlessRepository } from '../repositories/limitless.repository';
import { AffirmationRepository } from '../repositories/affirmation.repository';
import { DreamRepository } from '../repositories/dream.repository';
import { EmotionRepository } from '../repositories/emotional.repository';
import { GratitudeRepository } from '../repositories/gratitude.repository';
import { JourneyRepository } from '../repositories/journey.repository';
import { LessonRepository } from '../repositories/lesson.repository';
import { BaseEntity, DeepPartial, Repository } from 'typeorm';
import { BaseEntryTypeDto } from '../dto/base-entry-type.dto';



export interface EntryTypeConfig<T extends BaseEntity, U extends BaseEntryTypeDto> {
    entityType: new () => T;
    dtoType: new () => U;
    stringName: string;
    deepPartialType: DeepPartial<T>;
    repository: () => Repository<T>;
}

@Injectable()
export class EntryTypesService {

    constructor(
        private readonly limitlessRepository: LimitlessRepository,
        private readonly dreamRepository: DreamRepository,
        private readonly lessonRepository: LessonRepository,
        private readonly affirmationRepository: AffirmationRepository,
        private readonly gratitudeRepository: GratitudeRepository,
        private readonly emotionRepository: EmotionRepository,
        private readonly journeyRepository: JourneyRepository,
        private readonly customLoggerService: CustomLoggerService,
    ) {

        this.customLoggerService.setContext('EntryTypesService');
    }

    private getLimitlessRepository(): LimitlessRepository {
        return this.limitlessRepository;
    }
    private getDreamRepository(): DreamRepository {
        return this.dreamRepository;
    }
    private getLessonRepository(): LessonRepository {
        return this.lessonRepository;
    }
    private getAffirmationRepository(): AffirmationRepository {
        return this.affirmationRepository;
    }
    private getGratitudeRepository(): GratitudeRepository {
        return this.gratitudeRepository;
    }
    private getEmotionRepository(): EmotionRepository {
        return this.emotionRepository;
    }
    private getJourneyRepository(): JourneyRepository {
        return this.journeyRepository;
    }

    getEntryTypeString(entity: BaseEntity): string {
        // This logic would depend on how you can distinguish between different entities
        if (entity instanceof Affirmation) {
            return 'affirmation';
        }
        if (entity instanceof Dream) {
            return 'dream';
        }
        if (entity instanceof Lesson) {
            return 'lesson';
        }
        if (entity instanceof Limitless) {
            return 'limitless';
        }
        if (entity instanceof Gratitude) {
            return 'gratitude';
        }
        if (entity instanceof Emotion) {
            return 'emotion';
        }
        if (entity instanceof Journey) {
            return 'journey';
        }
        this.customLoggerService.error(`Unsupported entity type: ${entity.constructor.name}`, 'EntryTypesService');
        throw new Error(`Unsupported entity type: ${entity.constructor.name}`);
    }


    mapEntryTypeDtoToEntity(entryType: string, dto: DreamDto | LimitlessDto | GratitudeDto | EmotionDto | AffirmationDto | LessonDto | JourneyDto): DeepPartial<Dream | Limitless | Gratitude | Emotion | Affirmation | Lesson | Journey> {
        switch (entryType) {
            case 'dream':
                return dto as DeepPartial<Dream>;
            case 'limitless':
                return dto as DeepPartial<Limitless>;
            case 'gratitude':
                return dto as DeepPartial<Gratitude>;
            case 'emotion':
                return dto as DeepPartial<Emotion>;
            case 'affirmation':
                return dto as DeepPartial<Affirmation>;
            case 'lesson':
                return dto as DeepPartial<Lesson>;
            case 'journey':
                return dto as DeepPartial<Journey>;
            default:
                throw new Error('Unsupported entry type');
        }
    }
}