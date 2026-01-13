import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ResolveAttributionDto {
  @IsNotEmpty({ message: 'teacherId不能为空' })
  @IsNumber()
  teacherId: number;

  @IsOptional()
  @IsString()
  shareId?: string;

  @IsOptional()
  @IsString()
  scene?: string;
}

export class AttributionResponseDto {
  brokerId: number | null;
  shareId: string | null;
  expiresAt: Date | null;
  brokerInfo?: {
    id: number;
    name: string;
    avatar: string;
    contactInfo: any;
  };
}
