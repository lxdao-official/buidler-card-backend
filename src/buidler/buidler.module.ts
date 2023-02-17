import { Module } from '@nestjs/common';
import { BuidlerService } from './buidler.service';
import { BuidlerController } from './buidler.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
@Module({
  controllers: [BuidlerController],
  providers: [BuidlerService, PrismaService, JwtStrategy],
  exports: [BuidlerService],
})
export class BuidlerModule {}
