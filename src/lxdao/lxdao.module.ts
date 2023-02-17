import { Module } from '@nestjs/common';
import { BuidlerService } from '../buidler/buidler.service';
import { LxdaoController } from './lxdao.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ProjectService } from 'src/project/project.service';

@Module({
  controllers: [LxdaoController],
  providers: [BuidlerService, ProjectService, PrismaService, JwtStrategy],
  exports: [BuidlerService],
})
export class LxdaoModule {}
