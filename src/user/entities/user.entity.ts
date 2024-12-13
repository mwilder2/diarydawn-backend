import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { Book } from '../../book/entities/book.entity';

import { Profile } from '../../profile/entities/profile.entity';

@Entity()
@Unique(['email', 'id'])
export class User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 120 })
    public email: string;

    @Column({ type: 'varchar', length: 120, nullable: true })
    public password: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    public updatedAt: Date;

    @Column({ type: 'varchar', length: 120, nullable: true })
    public googleId: string;

    @OneToMany(() => Book, (book) => book.user, { onDelete: 'CASCADE' })
    book: Book[];

    @OneToOne(() => Profile, (profile) => profile.user, {
        onDelete: 'CASCADE',
    })
    profile: Profile;
}
