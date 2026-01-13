import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { WxUser } from '../../core/database/entities';
import { WxLoginDto, WxLoginResponseDto } from './dto/wx-login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

interface WxSessionResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(WxUser)
    private wxUserRepository: Repository<WxUser>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  /**
   * 微信小程序登录
   * 使用 code 换取 openid 和 session_key
   */
  async wxLogin(wxLoginDto: WxLoginDto): Promise<WxLoginResponseDto> {
    const { code } = wxLoginDto;

    // 调用微信 code2session 接口
    const wxSession = await this.code2Session(code);

    if (wxSession.errcode) {
      this.logger.error(`微信登录失败: ${wxSession.errmsg}`);
      throw new UnauthorizedException(`微信登录失败: ${wxSession.errmsg}`);
    }

    const { openid, unionid } = wxSession;

    // 查找或创建用户
    let wxUser = await this.wxUserRepository.findOne({ where: { openid } });
    let isNewUser = false;

    if (!wxUser) {
      isNewUser = true;
      wxUser = this.wxUserRepository.create({
        openid,
        unionid,
      });
      await this.wxUserRepository.save(wxUser);
      this.logger.log(`新用户注册: ${openid}`);
    }

    // 生成 JWT token
    const payload: JwtPayload = {
      sub: wxUser.id,
      openid: wxUser.openid,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      openid: wxUser.openid,
      userId: wxUser.id,
      isNewUser,
    };
  }

  /**
   * 调用微信 code2session 接口
   */
  private async code2Session(code: string): Promise<WxSessionResponse> {
    const appId = this.configService.get('wechat.appId');
    const secret = this.configService.get('wechat.secret');

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    try {
      const response = await firstValueFrom(this.httpService.get<WxSessionResponse>(url));
      return response.data;
    } catch (error) {
      this.logger.error('调用微信接口失败', error);
      throw new UnauthorizedException('微信登录失败，请稍后重试');
    }
  }

  /**
   * 验证 token 并返回用户信息
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('无效的token');
    }
  }
}
