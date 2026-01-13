import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TeacherModule } from '../../core/database/entities';

export interface LlmGenerationResult {
  leaderSummary: string;
  teacherSummary: string;
  clarifyingQuestions: string[];
  coverageScore: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  /**
   * 生成双摘要和澄清问题
   */
  async generateSummaries(
    intent: string,
    input: any,
    modules: TeacherModule[],
  ): Promise<LlmGenerationResult> {
    const userInput = typeof input === 'string' ? input : JSON.stringify(input);
    const modulesContext = modules
      .map((m) => `[模块：${m.title}]\n${m.description || '暂无描述'}`)
      .join('\n\n');

    // 构建符合需求文档8.2约束的Prompt
    const prompt = this.buildPrompt(intent, userInput, modulesContext);

    try {
      const response = await this.callLlm(prompt);
      return this.parseResponse(response);
    } catch (error) {
      this.logger.error('LLM调用失败', error);
      // 返回默认值，确保流程不中断
      return this.getDefaultResult(intent);
    }
  }

  /**
   * 构建Prompt - 严格遵循需求文档8.2约束
   */
  private buildPrompt(intent: string, userInput: string, modulesContext: string): string {
    return `你是一个专业的AI助理，负责为讲师生成售前摘要。请严格遵守以下规则：

【硬性约束 - 必须遵守】
1. 请仅基于以下讲师能力模块 [Modules] 与用户需求 [Intent/Input] 生成内容
2. 禁止虚构讲师不具备的能力或模块
3. 若模块覆盖不足，请输出缺口提醒与下一步澄清问题，不要强行编造方案

【讲师能力模块 Modules】
${modulesContext || '暂无模块信息'}

【用户需求 Intent/Input】
意图类型: ${intent}
用户输入: ${userInput}

【输出要求】
请以JSON格式输出以下内容：
{
  "leader_summary": "给决策者的摘要，简洁明了，不超过220个中文字符",
  "teacher_summary": "给执行者的详细摘要，包含方案建议，不超过800个中文字符",
  "clarifying_questions": ["问题1", "问题2", "问题3", "问题4", "问题5"],
  "coverage_score": 0.0到1.0之间的数字，表示需求与模块的覆盖度
}

【覆盖率评估标准】
- 1.0: 需求完全被现有模块覆盖
- 0.8-0.9: 大部分需求可覆盖，少量需要定制
- 0.6-0.7: 部分需求可覆盖，需要进一步沟通
- 0.4-0.5: 覆盖度较低，建议深入了解需求
- <0.4: 覆盖度很低，可能不太匹配

请直接输出JSON，不要包含其他文字。`;
  }

  /**
   * 调用LLM API
   */
  private async callLlm(prompt: string): Promise<string> {
    const apiKey = this.configService.get('llm.apiKey');
    const baseUrl = this.configService.get('llm.baseUrl');
    const model = this.configService.get('llm.model');

    const response = await firstValueFrom(
      this.httpService.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的售前助理，擅长分析客户需求并生成精准的摘要。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data.choices[0].message.content;
  }

  /**
   * 解析LLM响应
   */
  private parseResponse(response: string): LlmGenerationResult {
    try {
      // 尝试提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('无法提取JSON');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        leaderSummary: parsed.leader_summary || '',
        teacherSummary: parsed.teacher_summary || '',
        clarifyingQuestions: parsed.clarifying_questions || [],
        coverageScore: parseFloat(parsed.coverage_score) || 0.5,
      };
    } catch (error) {
      this.logger.error('解析LLM响应失败', error);
      return this.getDefaultResult('未知');
    }
  }

  /**
   * 获取默认结果
   */
  private getDefaultResult(intent: string): LlmGenerationResult {
    return {
      leaderSummary: `客户表达了${intent}相关的需求，建议进一步沟通了解详情。`,
      teacherSummary: `客户需求概述：${intent}。由于信息有限，建议通过以下问题进一步了解客户的具体需求和期望。`,
      clarifyingQuestions: [
        '您希望通过这次培训达成什么具体目标？',
        '您的团队目前面临的最大挑战是什么？',
        '您期望的培训形式是什么（线上/线下/混合）？',
        '您的预算范围大概是多少？',
        '您希望在什么时间段内完成培训？',
      ],
      coverageScore: 0.5,
    };
  }
}
