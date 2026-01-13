import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeacherHomeResponseDto } from './dto/teacher.dto';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  /**
   * 获取讲师主页信息
   * GET /teachers/:id/home
   */
  @Get(':id/home')
  async getTeacherHome(
    @Param('id', ParseIntPipe) id: number,
    @Query('brokerId') brokerId?: string,
  ): Promise<TeacherHomeResponseDto> {
    const brokerIdNum = brokerId ? parseInt(brokerId, 10) : undefined;
    return this.teachersService.getTeacherHome(id, brokerIdNum);
  }

  /**
   * 获取讲师详情
   * GET /teachers/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }
}
