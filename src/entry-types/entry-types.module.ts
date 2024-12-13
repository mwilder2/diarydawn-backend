import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthCoreModule } from '../auth-core/auth-core.module';
import { TypeOrmExModule } from '../common/typeorm/typeorm-ex.module';
import { AffirmationRepository } from './repositories/affirmation.repository';
import { Affirmation } from './entities/affirmation.entity';
import { DreamRepository } from './repositories/dream.repository';
import { Dream } from './entities/dream.entity';
import { Emotion } from './entities/emotion.entity';
import { EmotionRepository } from './repositories/emotional.repository';
import { GratitudeRepository } from './repositories/gratitude.repository';
import { Gratitude } from './entities/gratitude.entity';
import { JourneyRepository } from './repositories/journey.repository';
import { Journey } from './entities/journey.entity';
import { LessonRepository } from './repositories/lesson.repository';
import { Lesson } from './entities/lesson.entity';
import { LimitlessRepository } from './repositories/limitless.repository';
import { Limitless } from './entities/limitless.entity';
import { EntryTypesController } from './entry-types.controller';
import { EntryTypesService } from './services/entry-types.service';
import { CustomLoggerService } from '../common/services/custom-logger.service';

// EntryTypesModule
@Module({
    imports: [
        AuthCoreModule,
        TypeOrmExModule.forCustomRepository([
            LimitlessRepository,
            GratitudeRepository,
            AffirmationRepository,
            EmotionRepository,
            LessonRepository,
            DreamRepository,
            JourneyRepository,
        ]),
        TypeOrmModule.forFeature([
            Limitless,
            Gratitude,
            Affirmation,
            Emotion,
            Lesson,
            Dream,
            Journey,
        ]),
    ],
    controllers: [EntryTypesController],
    providers: [EntryTypesService, CustomLoggerService,],
    exports: [EntryTypesService],
})
export class EntryTypesModule {
}
