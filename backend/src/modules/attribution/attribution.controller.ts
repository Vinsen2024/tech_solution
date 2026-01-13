import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AttributionService } from './attribution.service';
import { ResolveAttributionDto, AttributionResponseDto } from './dto/resolve-attribution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attribution')
export class AttributionController {
  constructor(private readonly attributionService: AttributionService) {}

  /**
   * 解析归因
   * POST /attribution/resolve
   */
  @Post('resolve')
  @UseGuards(JwtAuthGuard)
  async resolve(
    @Req() req,
    @Body() resolveAttributionDto: ResolveAttributionDto,
  ): Promise<AttributionResponseDto> {
    const { openid } = req.user;
    const { teacherId, shareId, scene } = resolveAttributionDto;

    // 优先使用 shareId，如果不存在则尝试使用 scene
    const shareIdOrScene = shareId || scene;

    return this.attributionService.resolve(openid, teacherId, shareIdOrScene);
  }
}
