import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Book } from './book.entity';

@Entity()
export class Result {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    modelName: string;

    @Column()
    traitName: string;

    @Column()
    traitValue: string;

    @Column({ type: 'json', nullable: true })
    additionalInfo: any;

    @ManyToOne(() => Book, (book) => book.results, { onDelete: 'CASCADE' })
    @JoinColumn()
    book: Book;
}
