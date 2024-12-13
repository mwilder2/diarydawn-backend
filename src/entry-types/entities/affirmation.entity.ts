import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from '../../page/entities/page.entity';

@Entity()
export class Affirmation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @OneToOne(() => Page, (page) => page.affirmation, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    page: Page;
}
