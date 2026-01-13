import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher, TeacherModule as TeacherModuleEntity, Broker } from '../../core/database/entities';
import { TeacherHomeResponseDto } from './dto/teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(TeacherModuleEntity)
    private moduleRepository: Repository<TeacherModuleEntity>,
    @InjectRepository(Broker)
    private brokerRepository: Repository<Broker>,
  ) {}

  /**
   * 获取讲师主页信息
   */
  async getTeacherHome(teacherId: number, brokerId?: number): Promise<TeacherHomeResponseDto> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isActive: true },
    });

    if (!teacher) {
      throw new NotFoundException('讲师不存在');
    }

    // 获取讲师的能力模块
    const modules = await this.moduleRepository.find({
      where: { teacherId, isActive: true },
      order: { sortOrder: 'ASC' },
    });

    // 如果有经纪人ID，获取经纪人信息
    let brokerInfo = undefined;
    if (brokerId) {
      const broker = await this.brokerRepository.findOne({
        where: { id: brokerId, isActive: true },
      });
      if (broker) {
        brokerInfo = {
          id: broker.id,
          name: broker.name,
          avatar: broker.avatar,
          contactInfo: broker.contactInfo,
        };
      }
    }

    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        avatar: teacher.avatar,
        title: teacher.title,
        bio: teacher.bio,
        contactInfo: brokerId ? null : teacher.contactInfo, // 如果有经纪人，隐藏讲师联系方式
        ctaConfig: teacher.ctaConfig,
      },
      broker: brokerInfo,
      modules: modules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        tags: m.tags || [],
      })),
    };
  }

  /**
   * 获取讲师详情
   */
  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['modules'],
    });

    if (!teacher) {
      throw new NotFoundException('讲师不存在');
    }

    return teacher;
  }

  /**
   * 获取讲师的能力模块
   */
  async getActiveModules(teacherId: number): Promise<TeacherModuleEntity[]> {
    return this.moduleRepository.find({
      where: { teacherId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
