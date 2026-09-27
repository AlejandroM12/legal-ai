import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithId } from '../common/request-id.middleware';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithId>();
    return request.user;
  },
);
