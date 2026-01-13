import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Broker } from './broker.entity';

@Entity('wx_users')
export class WxUser {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 128, unique: true, comment: '微信用户唯一标识' })
  openid: string;

  @Column({ type: 'varchar', length: 128, nullable: true, comment: '微信开放平台唯一标识' })
  unionid: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '用户昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 512, nullable: true, comment: '用户头像URL' })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Teacher, (teacher) => teacher.wxUser)
  teacher: Teacher;

  @OneToOne(() => Broker, (broker) => broker.wxUser)
  broker: Broker;
}
