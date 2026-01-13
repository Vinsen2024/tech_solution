import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WxLoginDto, WxLoginResponseDto } from './dto/wx-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信小程序登录
   * POST /auth/wxLogin
   */
  @Post('wxLogin')
  @HttpCode(HttpStatus.OK)
  async wxLogin(@Body() wxLoginDto: WxLoginDto): Promise<WxLoginResponseDto> {
    return this.authService.wxLogin(wxLoginDto);
  }
}
