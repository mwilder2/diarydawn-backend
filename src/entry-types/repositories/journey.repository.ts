import { Repository } from 'typeorm';
import { CustomRepository } from '../../common/typeorm/typeorm-ex.decorator';
import { Journey } from '../entities/journey.entity';

@CustomRepository(Journey)
export class JourneyRepository extends Repository<Journey> {
}
