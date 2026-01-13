import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import { ExportJob, ExportJobStatus, ExportJobType, Lead } from '../../core/database/entities';
import { CreateExportDto, CreateExportResponseDto, ExportStatusResponseDto } from './dto/export.dto';
import { CosService } from './cos.service';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    @InjectRepository(ExportJob)
    private exportJobRepository: Repository<ExportJob>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectQueue('export-queue')
    private exportQueue: Queue,
    private cosService: CosService,
  ) {}

  /**
   * 创建导出任务
   */
  async create(createExportDto: CreateExportDto): Promise<CreateExportResponseDto> {
    const { leadId, type } = createExportDto;

    // 验证线索存在
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    // 检查覆盖率，如果太低则不生成完整PDF (硬约束 8.3)
    if (type === ExportJobType.MATCH_PDF && lead.coverageScore < 0.6) {
      this.logger.warn(`线索覆盖率过低，PDF将只包含建议和澄清问题: leadId=${leadId}, score=${lead.coverageScore}`);
    }

    // 创建导出任务记录
    const exportJob = this.exportJobRepository.create({
      leadId,
      type,
      status: ExportJobStatus.PENDING,
    });

    const savedJob = await this.exportJobRepository.save(exportJob);
    this.logger.log(`创建导出任务: jobId=${savedJob.id}, leadId=${leadId}, type=${type}`);

    // 将任务添加到队列
    await this.exportQueue.add(
      'generate-match-pdf',
      {
        jobId: savedJob.id,
        leadId,
      },
      {
        attempts: 3, // 重试3次
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return { jobId: savedJob.id };
  }

  /**
   * 获取导出任务状态
   */
  async getStatus(jobId: number): Promise<ExportStatusResponseDto> {
    const job = await this.exportJobRepository.findOne({ where: { id: jobId } });

    if (!job) {
      throw new NotFoundException('导出任务不存在');
    }

    let resultUrl = job.resultUrl;

    // 如果任务成功且有结果URL，生成新的签名URL
    if (job.status === ExportJobStatus.SUCCEEDED && job.resultUrl) {
      // 从完整URL中提取key
      const urlParts = job.resultUrl.split('.myqcloud.com/');
      if (urlParts.length > 1) {
        const key = urlParts[1].split('?')[0];
        resultUrl = await this.cosService.getSignedUrl(key);
      }
    }

    return {
      jobId: job.id,
      status: job.status,
      resultUrl,
      errorMessage: job.errorMessage,
    };
  }
}
