import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { JwtToken } from 'src/schema/jwt_tokens/jwt.token.entity';
import { JwtAuthPayload, JwtPair } from './interface/jwt.interface';
import { CONFIG_AUTH } from 'src/config/config.export';
import { randomUUID } from 'crypto';


@Injectable()
export class JwtService {

  @InjectRepository(JwtToken)
  private jwtRepository: Repository<JwtToken>;

  public async findTokenByRefreshToken(refresh_token: string): Promise<JwtToken> {
    return await this.jwtRepository.findOne({
      where: { refreshToken: refresh_token },
    });
  }

  public async deleteToken(userId: number, sessionId: string): Promise<void> {
    await this.jwtRepository.delete({
      sessionId: sessionId,
    });
  }

  public async createJwtTokens(userId: number): Promise<JwtPair> {
    const sessionId = randomUUID();
    const { accessToken, refreshToken } = this.generateAuthTokens({
      userId: userId,
      sessionId: sessionId
    });
    await this.jwtRepository.save({
      user: { id: userId },
      sessionId: sessionId,
      refreshToken: refreshToken,
    });
    return { accessToken, refreshToken };
  }

  public async updateJwtTokens(userId: number, sessionId: string): Promise<JwtPair> {
    const token = await this.jwtRepository.findOne({
      relations: { user: true },
      where: {
        user: { id: userId },
        sessionId: sessionId
      },
    });
    if (!token) {
      throw new BadRequestException();
    }
    const { accessToken, refreshToken } = this.generateAuthTokens({
      userId: userId,
      sessionId: sessionId
    });
    await this.jwtRepository.update({ id: token.id }, {
      refreshToken: refreshToken
    });
    return { accessToken, refreshToken };
  }

  public async getRecoveryToken(userId: number): Promise<string> {
    return sign({ userId }, CONFIG_AUTH.JWT_RECOVERY, {
      expiresIn: CONFIG_AUTH.JWT_RECOVERY_EXP
    });
  }

  public getJwtPayload(token: string, key: string): JwtPayload | string {
    try {
      return verify(token, key);
    } catch {
      return null;
    }
  }

  private generateAuthTokens(payload: JwtAuthPayload): JwtPair {
    return {
      accessToken: sign(payload, CONFIG_AUTH.JWT_ACCESS, {
        expiresIn: CONFIG_AUTH.JWT_ACCESS_EXP
      }),
      refreshToken: sign(payload, CONFIG_AUTH.JWT_REFRESH, {
        expiresIn: CONFIG_AUTH.JWT_REFRESH_EXP
      }),
    };
  }
}