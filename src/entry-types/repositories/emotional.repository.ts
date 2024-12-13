import { Repository } from 'typeorm';
import { CustomRepository } from '../../common/typeorm/typeorm-ex.decorator';
import { Emotion } from '../entities/emotion.entity';

@CustomRepository(Emotion)
export class EmotionRepository extends Repository<Emotion> {
}
