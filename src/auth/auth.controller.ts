import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BuidlerService } from 'src/buidler/buidler.service';
import { BusinessException } from 'src/common/business.exception';
import { ResponseData } from 'src/common/response.model';
import { Address } from 'src/types';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

class SigninDto {
  address: Address;
  signature: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly buidlerService: BuidlerService,
  ) {}

  @Post('/signin')
  async signin(
    @Body() signinDto: SigninDto,
  ): Promise<ResponseData<{ verified: boolean; access_token?: string }>> {
    const { address, signature } = signinDto;
    const nonce = await this.buidlerService.getNonce(address);
    const verified = await this.authService.verifySignature(
      address,
      signature,
      nonce,
    );

    if (verified) {
      const buidler = await this.buidlerService.findOneByAddress(address);
      if (!buidler) {
        throw new BusinessException({
          message: `Cannot find buidler with address ${address}`,
          error_code: 'BUIDLER_NOT_FOUND',
        });
      }
      // todo reuse signature
      await this.buidlerService.generateNonce(address);
      const { access_token } = await this.authService.signJWT(buidler);

      return {
        data: { verified: verified, access_token },
      };
    }

    return {
      data: {
        verified: false,
      },
    };
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
