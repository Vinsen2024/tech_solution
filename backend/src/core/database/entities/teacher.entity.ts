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
import { TeacherModule } from './teacher-module.entity';
import { Lead } from './lead.entity';
import { Share } from './share.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'wx_user_id', type: 'bigint', unsigned: true, comment: '关联的微信用户ID' })
  wxUserId: number;

  @Column({ type: 'varchar', length: 255, comment: '讲师姓名' })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: '讲师头像' })
  avatar: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '讲师标题/职位' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '讲师简介' })
  bio: string;

  @Column({ type: 'json', nullable: true, comment: '联系方式' })
  contactInfo: {
    phone?: string;
    wechat?: string;
    email?: string;
  };

  @Column({ type: 'json', nullable: true, comment: 'CTA配置' })
  ctaConfig: {
    text?: string;
    style?: string;
  };

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => WxUser, (wxUser) => wxUser.teacher)
  @JoinColumn({ name: 'wx_user_id' })
  wxUser: WxUser;

  @OneToMany(() => TeacherModule, (module) => module.teacher)
  modules: TeacherModule[];

  @OneToMany(() => Lead, (lead) => lead.teacher)
  leads: Lead[];

  @OneToMany(() => Share, (share) => share.teacher)
  shares: Share[];
}
