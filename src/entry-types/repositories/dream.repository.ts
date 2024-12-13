import { Repository } from 'typeorm';
import { CustomRepository } from '../../common/typeorm/typeorm-ex.decorator';
import { Dream } from '../entities/dream.entity';

@CustomRepository(Dream)
export class DreamRepository extends Repository<Dream> {
}
