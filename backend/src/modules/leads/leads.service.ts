import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus, TeacherModule, WxUser, Teacher, Broker } from '../../core/database/entities';
import { CreateLeadDto, CreateLeadResponseDto, LeadSummaryResponseDto, LeadListItemDto } from './dto/lead.dto';
import { LlmService } from './llm.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(TeacherModule)
    private moduleRepository: Repository<TeacherModule>,
    @InjectRepository(WxUser)
    private wxUserRepository: Repository<WxUser>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Broker)
    private brokerRepository: Repository<Broker>,
    private llmService: LlmService,
  ) {}

  /**
   * 创建线索
   */
  async create(wxUserId: number, createLeadDto: CreateLeadDto): Promise<CreateLeadResponseDto> {
    const { teacherId, intent, input, attribution } = createLeadDto;

    // 1. 验证讲师存在
    const teacher = await this.teacherRepository.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException('讲师不存在');
    }

    // 2. 生成前置检索：查询讲师的能力模块 (硬约束 8.1)
    const activeModules = await this.moduleRepository.find({
      where: { teacherId, isActive: true },
    });

    this.logger.log(`讲师 ${teacherId} 有 ${activeModules.length} 个活跃模块`);

    // 3. AI 生成摘要 (硬约束 8.2, 8.3)
    const { leaderSummary, teacherSummary, clarifyingQuestions, coverageScore } =
      await this.llmService.generateSummaries(intent, input, activeModules);

    // 4. 覆盖率规则判断 (硬约束 8.3)
    let finalTeacherSummary = teacherSummary;
    if (activeModules.length < 2 || coverageScore < 0.6) {
      finalTeacherSummary += '\n\n【缺口提醒】当前需求与讲师能力覆盖度较低，建议深入沟通以明确细节。';
      this.logger.warn(`线索覆盖率较低: modules=${activeModules.length}, score=${coverageScore}`);
    }

    // 5. 创建并保存 Lead 实体
    const newLead = new Lead();
    newLead.wxUserId = wxUserId;
    newLead.teacherId = teacherId;
    newLead.brokerId = attribution?.brokerId;
    newLead.shareId = attribution?.shareId;
    newLead.intent = intent;
    newLead.input = input;
    newLead.leaderSummary = leaderSummary;
    newLead.teacherSummary = finalTeacherSummary;
    newLead.clarifyingQuestions = clarifyingQuestions;
    newLead.coverageScore = coverageScore;
    newLead.status = LeadStatus.NEW;

    const savedLead = await this.leadRepository.save(newLead);
    this.logger.log(`线索创建成功: id=${savedLead.id}, teacherId=${teacherId}`);

    // TODO: 触发通知 (硬约束 10)
    // await this.notificationService.notifyOnNewLead(savedLead);

    return {
      leadId: savedLead.id,
      leaderSummary,
    };
  }

  /**
   * 获取线索摘要详情
   */
  async getSummary(leadId: number): Promise<LeadSummaryResponseDto> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });

    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    return {
      leadId: lead.id,
      leaderSummary: lead.leaderSummary,
      teacherSummary: lead.teacherSummary,
      clarifyingQuestions: lead.clarifyingQuestions || [],
      coverageScore: lead.coverageScore,
      status: lead.status,
    };
  }

  /**
   * 获取讲师的线索列表
   */
  async getTeacherLeads(teacherId: number, page = 1, limit = 20): Promise<LeadListItemDto[]> {
    const leads = await this.leadRepository.find({
      where: { teacherId },
      relations: ['wxUser'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return leads.map((lead) => ({
      id: lead.id,
      intent: lead.intent,
      leaderSummary: lead.leaderSummary,
      status: lead.status,
      createdAt: lead.createdAt,
      visitor: lead.wxUser
        ? {
            nickname: lead.wxUser.nickname || '访客',
            avatarUrl: lead.wxUser.avatarUrl || '',
          }
        : undefined,
    }));
  }

  /**
   * 获取经纪人的线索列表
   */
  async getBrokerLeads(brokerId: number, page = 1, limit = 20): Promise<LeadListItemDto[]> {
    const leads = await this.leadRepository.find({
      where: { brokerId },
      relations: ['wxUser', 'teacher'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return leads.map((lead) => ({
      id: lead.id,
      intent: lead.intent,
      leaderSummary: lead.leaderSummary,
      status: lead.status,
      createdAt: lead.createdAt,
      visitor: lead.wxUser
        ? {
            nickname: lead.wxUser.nickname || '访客',
            avatarUrl: lead.wxUser.avatarUrl || '',
          }
        : undefined,
    }));
  }

  /**
   * 更新线索状态
   */
  async updateStatus(leadId: number, status: LeadStatus): Promise<void> {
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });

    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    lead.status = status;
    await this.leadRepository.save(lead);
  }
}
