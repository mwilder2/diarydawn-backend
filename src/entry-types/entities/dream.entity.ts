import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from '../../page/entities/page.entity';

@Entity()
export class Dream {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('simple-array') // This column type will store an array of strings in the database
    symbols: string[];

    @OneToOne(() => Page, (page) => page.dream, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    page: Page;
}
