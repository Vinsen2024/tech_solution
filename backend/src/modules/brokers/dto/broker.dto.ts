import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShareDto {
  @IsNotEmpty({ message: 'teacherId不能为空' })
  @IsNumber()
  teacherId: number;

  @IsOptional()
  @IsString()
  scene?: string;
}

export class CreateShareResponseDto {
  shareId: string;
  path: string;
  scene?: string;
  expiresAt?: Date;
}
