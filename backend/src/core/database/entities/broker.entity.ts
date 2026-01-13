import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WxUser } from './wx-user.entity';
import { Lead } from './lead.entity';
import { Share } from './share.entity';

@Entity('brokers')
export class Broker {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'wx_user_id', type: 'bigint', unsigned: true, comment: '关联的微信用户ID' })
  wxUserId: number;

  @Column({ type: 'varchar', length: 255, comment: '经纪人姓名' })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: '经纪人头像' })
  avatar: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '经纪人职位' })
  title: string;

  @Column({ type: 'json', nullable: true, comment: '联系方式' })
  contactInfo: {
    phone?: string;
    wechat?: string;
    email?: string;
  };

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => WxUser, (wxUser) => wxUser.broker)
  @JoinColumn({ name: 'wx_user_id' })
  wxUser: WxUser;

  @OneToMany(() => Lead, (lead) => lead.broker)
  leads: Lead[];

  @OneToMany(() => Share, (share) => share.broker)
  shares: Share[];
}
