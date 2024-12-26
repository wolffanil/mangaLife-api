import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'src/user/schemas/user.model';

type TypeData = keyof UserDocument;

export const User = createParamDecorator(
  (data: TypeData, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request?.user;

    return data ? user[data] : user;
  },
);
