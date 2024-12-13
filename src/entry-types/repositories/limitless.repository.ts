import { Repository } from 'typeorm';
import { CustomRepository } from '../../common/typeorm/typeorm-ex.decorator';
import { Limitless } from '../entities/limitless.entity';

@CustomRepository(Limitless)
export class LimitlessRepository extends Repository<Limitless> {
}
