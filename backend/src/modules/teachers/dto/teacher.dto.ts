import { IsNotEmpty, IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class TeacherHomeResponseDto {
  teacher: {
    id: number;
    name: string;
    avatar: string;
    title: string;
    bio: string;
    contactInfo: any;
    ctaConfig: any;
  };
  broker?: {
    id: number;
    name: string;
    avatar: string;
    contactInfo: any;
  };
  modules: {
    id: number;
    title: string;
    description: string;
    tags: string[];
  }[];
}

export class CreateTeacherModuleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  sortOrder?: number;
}
