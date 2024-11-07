import { Request } from 'express';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { BaseGuard } from './base.guard';

@Injectable()
export class RefreshGuard extends BaseGuard implements CanActivate {

  constructor(jwtKey: string) {
    super(jwtKey);
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    request['jwt'] = this.getPayload(request.cookies['refreshToken'], this.jwtKey);
    return true;
  }
}