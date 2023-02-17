import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma.service';
import { BuidlerModule } from 'src/buidler/buidler.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, JwtStrategy, PrismaService],
  imports: [BuidlerModule]
})
export class ProjectModule {}
