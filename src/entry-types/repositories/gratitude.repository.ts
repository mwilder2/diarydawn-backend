import { Repository } from 'typeorm';
import { CustomRepository } from '../../common/typeorm/typeorm-ex.decorator';
import { Gratitude } from '../entities/gratitude.entity';

@CustomRepository(Gratitude)
export class GratitudeRepository extends Repository<Gratitude> {
}
