import { Controller, Post, Get, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { CreateExportDto, CreateExportResponseDto, ExportStatusResponseDto } from './dto/export.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  /**
   * 创建导出任务
   * POST /exports
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createExportDto: CreateExportDto): Promise<CreateExportResponseDto> {
    return this.exportsService.create(createExportDto);
  }

  /**
   * 获取导出任务状态
   * GET /exports/:jobId
   */
  @Get(':jobId')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param('jobId', ParseIntPipe) jobId: number): Promise<ExportStatusResponseDto> {
    return this.exportsService.getStatus(jobId);
  }
}
