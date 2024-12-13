import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { Book } from '../../book/entities/book.entity';
import { Affirmation } from '../../entry-types/entities/affirmation.entity';
import { Dream } from '../../entry-types/entities/dream.entity';
import { Emotion } from '../../entry-types/entities/emotion.entity';
import { Gratitude } from '../../entry-types/entities/gratitude.entity';
import { Journey } from '../../entry-types/entities/journey.entity';
import { Lesson } from '../../entry-types/entities/lesson.entity';
import { Limitless } from '../../entry-types/entities/limitless.entity';

@Entity()
export class Page {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 120 })
    entryType: string;

    @Column({ type: 'int', default: 0 })
    pageNumber: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column({ type: 'varchar', length: 120, nullable: true, default: '' })
    title: string;

    @Column({ type: 'varchar', length: 120, nullable: true, default: '' })
    emotionName: string;

    @Column({ type: 'int', nullable: true, default: 0 })
    emotionValue: number;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Book, (book) => book.pages)
    book: Book;

    @OneToOne(() => Limitless, (limitless) => limitless.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    limitless: Limitless;

    @OneToOne(() => Gratitude, (gratitude) => gratitude.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    gratitude: Gratitude;

    @OneToOne(() => Emotion, (emotion) => emotion.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    emotion: Emotion;

    @OneToOne(() => Dream, (dream) => dream.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    dream: Dream;

    @OneToOne(() => Affirmation, (affirmation) => affirmation.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    affirmation: Affirmation;

    @OneToOne(() => Lesson, (lesson) => lesson.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    lesson?: Lesson;

    @OneToOne(() => Journey, (journey) => journey.page, {
        cascade: true,
        nullable: true,
        onDelete: 'CASCADE',
    })
    journey: Journey;
}
