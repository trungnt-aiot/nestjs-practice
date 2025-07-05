import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { TaskPriority } from './task.enum';

@Entity('task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  tittle: string;

  @Column({ length: 1000 })
  content: string;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.LOW,
  })
  priority: TaskPriority;

  @Column()
  file: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.task)
  user: User;
}
