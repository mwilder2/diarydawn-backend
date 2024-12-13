import { Repository } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';
import { CustomRepository } from 'src/common/typeorm/typeorm-ex.decorator';

@CustomRepository(Lesson)
export class LessonRepository extends Repository<Lesson> {
}
