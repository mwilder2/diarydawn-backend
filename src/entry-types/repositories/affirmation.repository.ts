import { Repository } from 'typeorm';
import { CustomRepository } from '../../common/typeorm/typeorm-ex.decorator';
import { Affirmation } from '../entities/affirmation.entity';

@CustomRepository(Affirmation)
export class AffirmationRepository extends Repository<Affirmation> {
}
