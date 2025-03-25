import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100, unique: true })
    name!: string;

    @Column({ length: 50, unique: true })
    code!: string;

    @Column({ name: 'group_name', length: 100 })
    groupName!: string;

    @Column({ length: 255, nullable: true })
    description!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToMany(() => User, user => user.roles)
    users!: User[];
} 