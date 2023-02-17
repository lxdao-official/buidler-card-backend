import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { GetBuidler } from 'src/common/get-buidler.decorator';
import { Buidler } from '@prisma/client';
import { BusinessException } from 'src/common/business.exception';
import { CommonFilters } from 'src/common/query-filter.dto';
import { IsOptional, IsString } from 'class-validator';

class ProjectFilters extends CommonFilters {
  @IsOptional()
  @IsString()
  search?: string;
}

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @GetBuidler() builder: Buidler,
  ) {
    if (!builder) {
      throw new BusinessException({
        message: 'Buidler not found',
        error_code: 'BUIDLER_NOT_FOUND',
      });
    }

    createProjectDto = {
      ...createProjectDto,
    };
    return this.projectService.create(createProjectDto, builder.id);
  }

  @Get()
  async findAll(@Query() filters: ProjectFilters) {
    const total = await this.projectService.count();
    const currentPage = filters.page || 1;
    const perPage = filters.per_page || 9;
    const skip = (currentPage - 1) * perPage;
    const allProjects = await this.projectService.findAll(filters.search, {
      skip,
      take: perPage,
    });
    return {
      data: allProjects,
      pagination: {
        total,
        current: currentPage,
        per_page: perPage,
      },
    };
  }

  @Get(':number')
  async findOne(@Param('number') number: string) {
    const project = await this.projectService.findOne(number);
    return {
      data: project,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
