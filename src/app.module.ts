import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuidlerModule } from './buidler/buidler.module';
import { AuthModule } from './auth/auth.module';
import { LxdaoModule } from './lxdao/lxdao.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/all-exception.filter';
import { TransformInterceptor } from './common/transform.interceptor';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ProjectModule } from './project/project.module';
import { UploadModule } from './upload/upload.module';


@Module({
  imports: [
    BuidlerModule,
    AuthModule,
    LxdaoModule,
    ProjectModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
