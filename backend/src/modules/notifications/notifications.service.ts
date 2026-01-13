import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { WxUser, Lead, Teacher, Broker } from '../../core/database/entities';

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly WECHAT_API_BASE = 'https://api.weixin.qq.com';
  private accessTokenCache: AccessTokenCache | null = null;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(WxUser)
    private wxUserRepository: Repository<WxUser>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Broker)
    private brokerRepository: Repository<Broker>,
  ) {}

  /**
   * 发送新线索通知
   * 硬约束 10: 当 Lead created 时通知 broker 和 teacher
   */
  async notifyOnNewLead(lead: Lead): Promise<void> {
    // 通知经纪人
    if (lead.brokerId) {
      const broker = await this.brokerRepository.findOne({
        where: { id: lead.brokerId },
        relations: ['wxUser'],
      });

      if (broker?.wxUser?.openid) {
        await this.sendNewLeadNotification(
          broker.wxUser.openid,
          lead,
          'broker',
        );
      }
    }

    // 总是通知讲师（抄送，避免纠纷）
    const teacher = await this.teacherRepository.findOne({
      where: { id: lead.teacherId },
      relations: ['wxUser'],
    });

    if (teacher?.wxUser?.openid) {
      await this.sendNewLeadNotification(
        teacher.wxUser.openid,
        lead,
        'teacher',
      );
    }
  }

  /**
   * 发送订阅消息
   */
  private async sendNewLeadNotification(
    toOpenid: string,
    lead: Lead,
    recipientType: 'broker' | 'teacher',
  ): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const url = `${this.WECHAT_API_BASE}/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

      // 订阅消息模板ID（需要在小程序后台申请）
      const templateId = this.configService.get('wechat.newLeadTemplateId') || 'YOUR_TEMPLATE_ID';

      const messagePayload = {
        touser: toOpenid,
        template_id: templateId,
        page: `pages/lead/result?id=${lead.id}`,
        data: {
          // 根据实际申请的模板字段填充
          thing1: {
            value: this.truncateString(lead.intent, 20), // 需求类型
          },
          thing2: {
            value: this.truncateString(lead.leaderSummary, 20), // 需求摘要
          },
          date3: {
            value: new Date().toLocaleString('zh-CN'), // 提交时间
          },
        },
        miniprogram_state: this.configService.get('nodeEnv') === 'production' ? 'formal' : 'trial',
      };

      const response = await firstValueFrom(
        this.httpService.post(url, messagePayload),
      );

      if (response.data.errcode !== 0) {
        this.logger.warn(
          `发送订阅消息失败: ${response.data.errmsg}, toOpenid=${toOpenid}`,
        );
      } else {
        this.logger.log(
          `订阅消息发送成功: toOpenid=${toOpenid}, recipientType=${recipientType}`,
        );
      }
    } catch (error) {
      this.logger.error('发送订阅消息异常', error);
    }
  }

  /**
   * 获取微信 Access Token（带缓存）
   */
  private async getAccessToken(): Promise<string> {
    // 检查缓存
    if (
      this.accessTokenCache &&
      Date.now() < this.accessTokenCache.expiresAt
    ) {
      return this.accessTokenCache.token;
    }

    // 获取新的 token
    const appId = this.configService.get('wechat.appId');
    const secret = this.configService.get('wechat.secret');

    const url = `${this.WECHAT_API_BASE}/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      if (response.data.errcode) {
        throw new Error(response.data.errmsg);
      }

      // 缓存 token，提前5分钟过期
      this.accessTokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in - 300) * 1000,
      };

      return this.accessTokenCache.token;
    } catch (error) {
      this.logger.error('获取 Access Token 失败', error);
      throw error;
    }
  }

  /**
   * 截断字符串
   */
  private truncateString(str: string, maxLength: number): string {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 1) + '…';
  }
}
