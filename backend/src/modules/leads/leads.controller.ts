import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, CreateLeadResponseDto, LeadSummaryResponseDto, LeadListItemDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * 创建线索
   * POST /leads
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body() createLeadDto: CreateLeadDto,
  ): Promise<CreateLeadResponseDto> {
    const { userId } = req.user;
    return this.leadsService.create(userId, createLeadDto);
  }

  /**
   * 获取线索摘要详情
   * GET /leads/:id/summary
   */
  @Get(':id/summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LeadSummaryResponseDto> {
    return this.leadsService.getSummary(id);
  }
}

@Controller('teacher')
export class TeacherLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * 获取讲师的线索列表
   * GET /teacher/leads
   */
  @Get('leads')
  @UseGuards(JwtAuthGuard)
  async getTeacherLeads(
    @Req() req,
    @Query('teacherId', ParseIntPipe) teacherId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<LeadListItemDto[]> {
    // TODO: 验证当前用户是否是该讲师
    return this.leadsService.getTeacherLeads(
      teacherId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}

@Controller('broker')
export class BrokerLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * 获取经纪人的线索列表
   * GET /broker/leads
   */
  @Get('leads')
  @UseGuards(JwtAuthGuard)
  async getBrokerLeads(
    @Req() req,
    @Query('brokerId', ParseIntPipe) brokerId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<LeadListItemDto[]> {
    // TODO: 验证当前用户是否是该经纪人
    return this.leadsService.getBrokerLeads(
      brokerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
