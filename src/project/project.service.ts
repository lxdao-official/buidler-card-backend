import { Injectable } from '@nestjs/common';
import { BuidlerOnProjectStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { BuidlerRole } from '../common/buidler-role';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, buidlerId: number) {
    const now = new Date().toISOString();

    return await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        number: createProjectDto.number,
        buidlersOnProject: {
          create: [
            {
              createdAt: now,
              updatedAt: now,
              buidlerId: buidlerId,
              projectRole: [BuidlerRole.ProjectManager],
              status: BuidlerOnProjectStatus.ACTIVE,
              startedAt: createProjectDto.startedAt
                ? new Date(createProjectDto.startedAt).toISOString()
                : now,
            },
          ],
        },
      },
    });
  }

  async findAll(
    search?: string,
    params?: {
      skip?: number;
      take?: number;
      cursor?: Prisma.ProjectWhereUniqueInput;
      where?: Prisma.ProjectWhereInput;
      orderBy?: Prisma.ProjectOrderByWithRelationInput;
      include?: Prisma.BuidlerOnProjectInclude;
    },
  ) {
    const find = {
      ...params,
      include: { buidlersOnProject: { include: { buidler: true } } },
    };
    if (search && search.length > 0) {
      find['where'] = {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }
    const allProjects = await this.prisma.project.findMany(find);
    return allProjects;
  }

  async findOne(number: string) {
    const project = await this.prisma.project.findUnique({
      where: {
        number,
      },
      include: { buidlersOnProject: { include: { buidler: true } } },
    });
    return project;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async count() {
    return await this.prisma.project.count();
  }
}
