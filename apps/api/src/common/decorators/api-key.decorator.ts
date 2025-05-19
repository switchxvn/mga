import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiKey } from '../../../../backend/src/modules/api-key/entities/api-key.entity';

export const ApiKeyData = createParamDecorator(
  (data: keyof ApiKey | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const apiKey = request.apiKey;

    return data ? apiKey?.[data] : apiKey;
  },
); 