import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Teacher } from './teacher.entity';

@Entity('teacher_modules')
export class TeacherModule {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'teacher_id', type: 'bigint', unsigned: true, comment: '所属讲师ID' })
  teacherId: number;

  @Column({ type: 'varchar', length: 255, comment: '模块标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '模块详细描述' })
  description: string;

  @Column({ type: 'json', nullable: true, comment: '模块标签' })
  tags: string[];

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.modules)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}
