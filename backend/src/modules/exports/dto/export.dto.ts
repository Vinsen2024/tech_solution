import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { ExportJobType } from '../../../core/database/entities';

export class CreateExportDto {
  @IsNotEmpty({ message: 'leadId不能为空' })
  @IsNumber()
  leadId: number;

  @IsNotEmpty({ message: 'type不能为空' })
  @IsEnum(ExportJobType)
  type: ExportJobType;
}

export class CreateExportResponseDto {
  jobId: number;
}

export class ExportStatusResponseDto {
  jobId: number;
  status: string;
  resultUrl?: string;
  errorMessage?: string;
}
