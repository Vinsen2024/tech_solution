import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Broker } from './broker.entity';

@Entity('shares')
@Index('idx_teacher_broker', ['teacherId', 'brokerId'])
export class Share {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'share_id', type: 'varchar', length: 64, unique: true, comment: '分享唯一ID' })
  shareId: string;

  @Column({ name: 'teacher_id', type: 'bigint', unsigned: true, comment: '关联讲师ID' })
  teacherId: number;

  @Column({ name: 'broker_id', type: 'bigint', unsigned: true, comment: '关联经纪人ID' })
  brokerId: number;

  @Column({ name: 'is_active', type: 'boolean', default: true, comment: '是否有效' })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true, default: null, comment: '过期时间' })
expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.shares)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Broker, (broker) => broker.shares)
  @JoinColumn({ name: 'broker_id' })
  broker: Broker;
}
