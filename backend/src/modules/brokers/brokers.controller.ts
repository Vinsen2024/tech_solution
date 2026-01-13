import { Controller, Post, Get, Body, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { BrokersService } from './brokers.service';
import { CreateShareDto, CreateShareResponseDto } from './dto/broker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('broker')
export class BrokersController {
  constructor(private readonly brokersService: BrokersService) {}

  /**
   * 创建分享链接
   * POST /broker/shares
   */
  @Post('shares')
  @UseGuards(JwtAuthGuard)
  async createShare(
    @Req() req,
    @Body() createShareDto: CreateShareDto,
    @Query('brokerId', ParseIntPipe) brokerId: number,
  ): Promise<CreateShareResponseDto> {
    // TODO: 验证当前用户是否是该经纪人
    return this.brokersService.createShare(brokerId, createShareDto);
  }

  /**
   * 获取经纪人的所有分享链接
   * GET /broker/shares
   */
  @Get('shares')
  @UseGuards(JwtAuthGuard)
  async getShares(
    @Req() req,
    @Query('brokerId', ParseIntPipe) brokerId: number,
  ) {
    // TODO: 验证当前用户是否是该经纪人
    return this.brokersService.getShares(brokerId);
  }
}
