import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addDays } from 'date-fns';
import { Share, VisitorBinding, Broker } from '../../core/database/entities';
import { AttributionResponseDto } from './dto/resolve-attribution.dto';

@Injectable()
export class AttributionService {
  private readonly logger = new Logger(AttributionService.name);
  private readonly BINDING_WINDOW_DAYS = 30;

  constructor(
    @InjectRepository(Share)
    private shareRepository: Repository<Share>,
    @InjectRepository(VisitorBinding)
    private bindingRepository: Repository<VisitorBinding>,
    @InjectRepository(Broker)
    private brokerRepository: Repository<Broker>,
  ) {}

  /**
   * 解析归因
   * 实现 Last Click within window (30天) 模型
   */
  async resolve(
    openid: string,
    teacherId: number,
    shareIdOrScene?: string,
  ): Promise<AttributionResponseDto> {
    let validShare: Share | null = null;

    // 1. 如果有 shareId 或 scene，验证分享链接
    if (shareIdOrScene) {
      const shareId = this.decodeScene(shareIdOrScene);
      validShare = await this.validateShare(shareId);
    }

    // 2. 查询现有绑定关系
    const existingBinding = await this.bindingRepository.findOne({
      where: { wxUserOpenid: openid, teacherId },
    });

    // 3. 根据归因规则处理
    if (validShare) {
      // 有效的分享链接 -> 更新或创建绑定
      const expiresAt = addDays(new Date(), this.BINDING_WINDOW_DAYS);

      const bindingData = {
        wxUserOpenid: openid,
        teacherId: teacherId,
        brokerId: validShare.brokerId,
        lastShareId: validShare.shareId,
        lastBoundAt: new Date(),
        expiresAt,
      };

      if (existingBinding) {
        await this.bindingRepository.update(existingBinding.id, bindingData);
        this.logger.log(`更新归因绑定: openid=${openid}, teacherId=${teacherId}, brokerId=${validShare.brokerId}`);
      } else {
        await this.bindingRepository.save(bindingData);
        this.logger.log(`创建归因绑定: openid=${openid}, teacherId=${teacherId}, brokerId=${validShare.brokerId}`);
      }

      // 获取经纪人信息
      const brokerInfo = await this.getBrokerInfo(validShare.brokerId);

      return {
        brokerId: validShare.brokerId,
        shareId: validShare.shareId,
        expiresAt,
        brokerInfo,
      };
    } else if (existingBinding && new Date() < existingBinding.expiresAt) {
      // 无有效分享链接，但有未过期的绑定 -> 返回现有绑定
      const brokerInfo = await this.getBrokerInfo(existingBinding.brokerId);

      return {
        brokerId: existingBinding.brokerId,
        shareId: existingBinding.lastShareId,
        expiresAt: existingBinding.expiresAt,
        brokerInfo,
      };
    } else {
      // 无有效分享链接，无有效绑定 -> 返回空
      return {
        brokerId: null,
        shareId: null,
        expiresAt: null,
      };
    }
  }

  /**
   * 验证分享链接是否有效
   */
  private async validateShare(shareId: string): Promise<Share | null> {
    if (!shareId) return null;

    const share = await this.shareRepository.findOne({
      where: { shareId, isActive: true },
    });

    if (!share) {
      this.logger.warn(`分享链接不存在或已禁用: ${shareId}`);
      return null;
    }

    // 检查是否过期
    if (share.expiresAt && new Date() > share.expiresAt) {
      this.logger.warn(`分享链接已过期: ${shareId}`);
      return null;
    }

    return share;
  }

  /**
   * 解码 scene 参数
   * 小程序码的 scene 可能是编码后的字符串
   */
  private decodeScene(scene: string): string {
    // 如果是 URL 编码的，先解码
    try {
      const decoded = decodeURIComponent(scene);
      // 如果 scene 格式是 "s=xxx"，提取 share_id
      const match = decoded.match(/s=([^&]+)/);
      if (match) {
        return match[1];
      }
      return decoded;
    } catch {
      return scene;
    }
  }

  /**
   * 获取经纪人信息
   */
  private async getBrokerInfo(brokerId: number) {
    const broker = await this.brokerRepository.findOne({
      where: { id: brokerId },
    });

    if (!broker) return undefined;

    return {
      id: broker.id,
      name: broker.name,
      avatar: broker.avatar,
      contactInfo: broker.contactInfo,
    };
  }
}
