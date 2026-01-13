import { IsNotEmpty, IsNumber, IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AttributionDto {
  @IsOptional()
  @IsNumber()
  brokerId?: number;

  @IsOptional()
  @IsString()
  shareId?: string;
}

class InputDto {
  @IsNotEmpty()
  @IsString()
  type: 'text' | 'voice' | 'select';

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  voiceUrl?: string;

  @IsOptional()
  selections?: string[];
}

export class CreateLeadDto {
  @IsNotEmpty({ message: 'teacherId不能为空' })
  @IsNumber()
  teacherId: number;

  @IsNotEmpty({ message: 'intent不能为空' })
  @IsString()
  intent: string;

  @IsNotEmpty({ message: 'input不能为空' })
  @ValidateNested()
  @Type(() => InputDto)
  input: InputDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AttributionDto)
  attribution?: AttributionDto;
}

export class CreateLeadResponseDto {
  leadId: number;
  leaderSummary: string;
}

export class LeadSummaryResponseDto {
  leadId: number;
  leaderSummary: string;
  teacherSummary: string;
  clarifyingQuestions: string[];
  coverageScore: number;
  status: string;
}

export class LeadListItemDto {
  id: number;
  intent: string;
  leaderSummary: string;
  status: string;
  createdAt: Date;
  visitor?: {
    nickname: string;
    avatarUrl: string;
  };
}
