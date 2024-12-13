import { User } from 'src/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 120 })
    name: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'date', nullable: true })
    birthdate: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    pictureUrl: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string;

    @Column('simple-array', { nullable: true })
    interests: string[];

    @Column({ type: 'varchar', length: 255, nullable: true })
    website: string;

    @Column('json', { nullable: true })
    socialLinks: { [key: string]: string };

    @CreateDateColumn()
    joinedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastActive: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    theme: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}
