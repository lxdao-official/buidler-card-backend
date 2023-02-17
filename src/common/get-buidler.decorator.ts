import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Buidler } from '@prisma/client';

export const GetBuidler = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Buidler => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
