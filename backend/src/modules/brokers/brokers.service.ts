import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { Share, Broker, Teacher } from '../../core/database/entities';
import { CreateShareDto, CreateShareResponseDto } from './dto/broker.dto';

@Injectable()
export class BrokersService {
  private readonly logger = new Logger(BrokersService.name);
  private readonly SHARE_EXPIRY_DAYS = 90; // 分享链接有效期90天

  constructor(
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
    @InjectRepository(Broker)
    private brokerRepository: Repository<Broker>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  /**
   * 创建分享链接
   */
  async createShare(brokerId: number, createShareDto: CreateShareDto): Promise<CreateShareResponseDto> {
    const { teacherId } = createShareDto;

    // 验证经纪人存在
    const broker = await this.brokerRepository.findOne({ where: { id: brokerId } });
    if (!broker) {
      throw new NotFoundException('经纪人不存在');
    }

    // 验证讲师存在
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException('讲师不存在');
    }

    // 检查是否已存在有效的分享链接
    const existingShare = await this.shareRepository.findOne({
      where: { brokerId, teacherId, isActive: true },
    });

    if (existingShare && (!existingShare.expiresAt || new Date() < existingShare.expiresAt)) {
      // 返回现有的分享链接
      return {
        shareId: existingShare.shareId,
        path: `/pages/teacher/home?teacherId=${teacherId}&share_id=${existingShare.shareId}`,
        scene: `s=${existingShare.shareId}`,
        expiresAt: existingShare.expiresAt ?? undefined,
      };
    }

    // 创建新的分享链接
    const shareId = this.generateShareId();
    const expiresAt = addDays(new Date(), this.SHARE_EXPIRY_DAYS);

    const newShare = this.shareRepository.create({
      shareId,
      teacherId,
      brokerId,
      isActive: true,
      expiresAt,
    });

    await this.shareRepository.save(newShare);
    this.logger.log(`创建分享链接: shareId=${shareId}, brokerId=${brokerId}, teacherId=${teacherId}`);

    return {
      shareId,
      path: `/pages/teacher/home?teacherId=${teacherId}&share_id=${shareId}`,
      scene: `s=${shareId}`,
      expiresAt,
    };
  }

  /**
   * 获取经纪人的所有分享链接
   */
  async getShares(brokerId: number): Promise<Share[]> {
    return this.shareRepository.find({
      where: { brokerId, isActive: true },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 生成唯一的分享ID
   */
  private generateShareId(): string {
    // 使用短UUID格式，便于分享
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }
}
