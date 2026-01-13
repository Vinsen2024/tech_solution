import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportJob, ExportJobStatus, Lead, Teacher, TeacherModule } from '../../core/database/entities';
import { CosService } from './cos.service';

interface PdfJobData {
  jobId: number;
  leadId: number;
}

@Processor('export-queue')
export class PdfExportProcessor {
  private readonly logger = new Logger(PdfExportProcessor.name);
  private readonly JOB_TIMEOUT = 60000; // 60秒超时

  constructor(
    @InjectRepository(ExportJob)
    private exportJobRepository: Repository<ExportJob>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherModule)
    private moduleRepository: Repository<TeacherModule>,
    private cosService: CosService,
  ) {}

  @Process({
    name: 'generate-match-pdf',
    concurrency: 2, // 并发数设置为2 (硬约束 9)
  })
  async handlePdfGeneration(job: Job<PdfJobData>): Promise<void> {
    const { jobId, leadId } = job.data;
    this.logger.log(`开始处理PDF导出任务: jobId=${jobId}, leadId=${leadId}`);

    // 更新状态为 RUNNING
    await this.updateJobStatus(jobId, ExportJobStatus.RUNNING);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('任务超时')), this.JOB_TIMEOUT),
    );

    try {
      await Promise.race([
        this.generateAndUploadPdf(jobId, leadId),
        timeoutPromise,
      ]);
    } catch (error) {
      this.logger.error(`PDF导出任务失败: jobId=${jobId}`, error);
      await this.updateJobStatus(jobId, ExportJobStatus.FAILED, null, error.message);
      throw error;
    }
  }

  private async generateAndUploadPdf(jobId: number, leadId: number): Promise<void> {
    // 1. 获取生成PDF所需的数据
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['teacher'],
    });

    if (!lead) {
      throw new Error('线索不存在');
    }

    const teacher = await this.teacherRepository.findOne({
      where: { id: lead.teacherId },
    });

    const modules = await this.moduleRepository.find({
      where: { teacherId: lead.teacherId, isActive: true },
    });

    // 2. 生成HTML内容
    const htmlContent = this.renderHtmlTemplate(lead, teacher, modules);

    // 3. 使用Puppeteer生成PDF
    // 注意：实际项目中需要安装 puppeteer
    // const puppeteer = require('puppeteer');
    // const browser = await puppeteer.launch({
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // });
    // const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    // const pdfBuffer = await page.pdf({ format: 'A4' });
    // await browser.close();

    // 模拟PDF生成
    const pdfBuffer = Buffer.from(htmlContent);
    this.logger.log(`PDF生成完成: leadId=${leadId}`);

    // 4. 上传到COS (硬约束 9: COS路径规范)
    const cosPath = `teachers/${lead.teacherId}/leads/${leadId}/exports/${jobId}.pdf`;
    const uploadResult = await this.cosService.upload(cosPath, pdfBuffer);

    // 5. 生成签名URL
    const signedUrl = await this.cosService.getSignedUrl(cosPath);

    // 6. 更新任务状态为成功
    await this.updateJobStatus(jobId, ExportJobStatus.SUCCEEDED, signedUrl);
    this.logger.log(`PDF导出任务完成: jobId=${jobId}, url=${signedUrl}`);
  }

  /**
   * 渲染PDF HTML模板 (硬约束 9: PDF内容结构)
   */
  private renderHtmlTemplate(lead: Lead, teacher: Teacher, modules: TeacherModule[]): string {
    const matchedModules = modules.slice(0, 3); // 取前3个模块作为推荐

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>匹配分析报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif; padding: 40px; line-height: 1.6; }
    h1 { font-size: 24px; color: #333; margin-bottom: 20px; text-align: center; }
    h2 { font-size: 18px; color: #444; margin: 20px 0 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
    p { margin: 10px 0; color: #666; }
    .section { margin-bottom: 30px; }
    .module-item { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .module-title { font-weight: bold; color: #333; }
    .question-item { padding: 8px 0; border-bottom: 1px dashed #eee; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 8px; color: #856404; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📊 匹配分析报告</h1>
  
  <div class="section">
    <h2>一、客户需求摘要</h2>
    <p>${lead.leaderSummary}</p>
  </div>

  <div class="section">
    <h2>二、适配结论</h2>
    ${matchedModules.map((m, i) => `
    <div class="module-item">
      <div class="module-title">${i + 1}. ${m.title}</div>
      <p>${m.description || '暂无描述'}</p>
    </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>三、推荐模块组合</h2>
    <ul>
      ${modules.map(m => `<li>${m.title}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>四、交付建议</h2>
    <p>${lead.teacherSummary}</p>
  </div>

  <div class="section">
    <h2>五、风险与边界</h2>
    ${lead.coverageScore < 0.6 ? `
    <div class="warning">
      <strong>⚠️ 缺口提醒：</strong>当前需求与讲师能力覆盖度较低（${(lead.coverageScore * 100).toFixed(0)}%），建议深入沟通以明确细节。
    </div>
    ` : '<p>当前需求与讲师能力匹配度良好。</p>'}
  </div>

  <div class="section">
    <h2>六、澄清问题</h2>
    ${(lead.clarifyingQuestions || []).map((q, i) => `
    <div class="question-item">${i + 1}. ${q}</div>
    `).join('')}
  </div>

  <div class="footer">
    <p>本报告由 AI讲师成交中枢 自动生成</p>
    <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>
    `;
  }

  private async updateJobStatus(
    jobId: number,
    status: ExportJobStatus,
    resultUrl?: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.exportJobRepository.update(jobId, {
      status,
      resultUrl,
      errorMessage,
    });
  }
}
