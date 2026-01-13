import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('visitor_bindings')
@Index('uk_openid_teacher_id', ['wxUserOpenid', 'teacherId'], { unique: true })
export class VisitorBinding {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'wx_user_openid', type: 'varchar', length: 128, comment: '访客的OpenID' })
  wxUserOpenid: string;

  @Column({ name: 'teacher_id', type: 'bigint', unsigned: true, comment: '关联讲师ID' })
  teacherId: number;

  @Column({ name: 'broker_id', type: 'bigint', unsigned: true, comment: '绑定的经纪人ID' })
  brokerId: number;

  @Column({ name: 'last_share_id', type: 'varchar', length: 64, comment: '最后一次绑定的分享ID' })
  lastShareId: string;

  @Column({ name: 'last_bound_at', type: 'timestamp', comment: '最后绑定时间' })
  lastBoundAt: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true, default: null, comment: '绑定过期时间' })
expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
