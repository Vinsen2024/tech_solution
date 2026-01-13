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
import { Lead } from './lead.entity';

export enum ExportJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum ExportJobType {
  MATCH_PDF = 'MATCH_PDF',
}

@Entity('export_jobs')
@Index('idx_lead_id', ['leadId'])
export class ExportJob {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'lead_id', type: 'bigint', unsigned: true, comment: '关联的线索ID' })
  leadId: number;

  @Column({
    type: 'enum',
    enum: ExportJobType,
    comment: '导出类型',
  })
  type: ExportJobType;

  @Column({
    type: 'enum',
    enum: ExportJobStatus,
    default: ExportJobStatus.PENDING,
    comment: '任务状态',
  })
  status: ExportJobStatus;

  @Column({ name: 'result_url', type: 'varchar', length: 1024, nullable: true, comment: '结果文件URL' })
  resultUrl: string;

  @Column({ name: 'error_message', type: 'text', nullable: true, comment: '失败错误信息' })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lead, (lead) => lead.exportJobs)
  @JoinColumn({ name: 'lead_id' })
  lead: Lead;
}
