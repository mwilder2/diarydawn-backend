import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Page } from '../../page/entities/page.entity';
import { User } from '../../user/entities/user.entity';
import { Result } from './result.entity';

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.book)
    user: User;

    @Column({ type: 'varchar', length: 120 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'integer', nullable: true })
    order: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => Page, (page) => page.book, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    pages: Page[];

    @OneToMany(() => Result, (result) => result.book, { onDelete: 'CASCADE' })
    results: Result[];

    @Column({ type: 'varchar', length: 255, nullable: true })
    heroImageUrl: string;  // URL of the hero image stored in S3
}
