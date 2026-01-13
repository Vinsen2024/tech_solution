import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { WxUser } from './wx-user.entity';
import { Teacher } from './teacher.entity';
import { Broker } from './broker.entity';
import { ExportJob } from './export-job.entity';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CLOSED = 'CLOSED',
}

@Entity('leads')
@Index('idx_teacher_broker', ['teacherId', 'brokerId'])
@Index('idx_wx_user_id', ['wxUserId'])
export class Lead {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'wx_user_id', type: 'bigint', unsigned: true, comment: '提交线索的微信用户ID' })
  wxUserId: number;

  @Column({ name: 'teacher_id', type: 'bigint', unsigned: true, comment: '关联讲师ID' })
  teacherId: number;

  @Column({ name: 'broker_id', type: 'bigint', unsigned: true, nullable: true, comment: '归属经纪人id' })
  brokerId?: number;

  @Column({ name: 'share_id', type: 'varchar', length: 64, nullable: true, comment: '来源分享id' })
  shareId?: string;

  @Column({ type: 'varchar', length: 255, comment: '用户意图' })
  intent: string;

  @Column({ type: 'json', comment: '用户输入 (text/voice/select)' })
  input: {
    type: 'text' | 'voice' | 'select';
    content: string;
    voiceUrl?: string;
    selections?: string[];
  };

  @Column({ name: 'leader_summary', type: 'varchar', length: 300, comment: '给决策者的摘要' })
  leaderSummary: string;

  @Column({ name: 'teacher_summary', type: 'varchar', length: 1000, comment: '给执行者的摘要' })
  teacherSummary: string;

  @Column({ name: 'clarifying_questions', type: 'json', nullable: true, comment: '5个澄清问题' })
  clarifyingQuestions: string[];

  @Column({ name: 'coverage_score', type: 'decimal', precision: 3, scale: 2, nullable: true, comment: '覆盖率评分' })
  coverageScore: number;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
    comment: '线索状态',
  })
  status: LeadStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => WxUser)
  @JoinColumn({ name: 'wx_user_id' })
  wxUser: WxUser;

  @ManyToOne(() => Teacher, (teacher) => teacher.leads)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Broker, (broker) => broker.leads)
  @JoinColumn({ name: 'broker_id' })
  broker: Broker;

  @OneToMany(() => ExportJob, (job) => job.lead)
  exportJobs: ExportJob[];
}
