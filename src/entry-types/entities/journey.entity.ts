import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Page } from '../../page/entities/page.entity';

@Entity()
export class Journey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    content: string;

    @OneToOne(() => Page, (page) => page.journey, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    page: Page;
}
