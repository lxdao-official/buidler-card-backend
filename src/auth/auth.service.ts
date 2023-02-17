import { Injectable, HttpException } from '@nestjs/common';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { JwtService } from '@nestjs/jwt';

import { BusinessException } from 'src/common/business.exception';
import { SIGNIN_MESSAGE } from 'src/common/constants';

import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Buidler } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async verifySignature(
    address: string,
    signature: string,
    nonce: string,
  ): Promise<boolean> {
    let recoveredAddr;
    try {
      recoveredAddr = recoverPersonalSignature({
        data: `${SIGNIN_MESSAGE} Nonce: ${nonce}.`,
        signature,
      });
    } catch (err) {
      throw new BusinessException({
        message: 'Failed to verify your signature.',
        dev_message: err.message,
        error_code: 'FAILED_To_PARSE_SIGNATURE',
      });
    }

    if (recoveredAddr.toLowerCase() !== address.toLowerCase()) {
      throw new BusinessException({
        message: 'Failed to verify your signature.',
        dev_message: 'Signature is incorrect.',
        error_code: 'FAILED_To_PARSE_SIGNATURE',
      });
    }

    return true;
  }

  async signJWT(buidler: Partial<Buidler>): Promise<{ access_token: string }> {
    return {
      access_token: this.jwtService.sign(buidler),
    };
  }
}
