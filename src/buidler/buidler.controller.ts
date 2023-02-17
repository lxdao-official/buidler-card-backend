import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UnauthorizedException,
  Header,
  Put,
} from '@nestjs/common';
import { createReadStream, existsSync, writeFileSync, unlinkSync } from 'fs';
import { Buidler } from '@prisma/client';
import { join } from 'path';
import * as bs58 from 'bs58';
import { createCanvas, loadImage } from 'canvas';

import { BusinessException } from 'src/common/business.exception';
import { SIGNIN_MESSAGE } from 'src/common/constants';
import { GetBuidler } from 'src/common/get-buidler.decorator';
import { CommonFilters } from 'src/common/query-filter.dto';
import { ResponseData } from 'src/common/response.model';
import { Address } from 'src/types';
import { BuidlerService } from './buidler.service';
import { CreateBuidlerDto } from './dto/create-buidler.dto';
import {
  UpdateBuidlerDto,
  UpdateBuidlerStatusDto,
} from './dto/update-buidler.dto';
import { Nonce } from './entities/nonce.entity';
import { IsOptional, IsString } from 'class-validator';
import { BuidlerStatus } from '@prisma/client';
import { storeBuidlerMetaData } from '../common/storage';
import { UpdateBuidlerProjectDto } from './dto/update-buidler-project.dto';
import { BuidlerRole } from '../common/buidler-role';
import { capitalize, convertIpfsGateway } from '../common/utils';

// todo add more filters
class BuidlerFilters extends CommonFilters {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

function getMetadata(result) {
  return {
    avatar: result.avatar,
    name: result.name,
    description: result.description,
    skills: result.skills,
    interests: result.interests,
    contacts: result.contacts,
    role: result.role,
    image: result.image,
    address: result.address,
    projects: result.projects.length
      ? result.projects.map((project) => {
          return {
            projectNumber: project.project.number,
            projectRole: project.projectRole,
            startedAt: project.startedAt || '-',
            endedAt: project.endedAt || '-',
          };
        })
      : [],
    buddyAddress: result.buddies.length ? result.buddies[0].address : null,
  };
}

function ipfsToBytes(ipfsURI) {
  const ipfsHash = ipfsURI.replace('ipfs://', '');
  return bs58.decode(ipfsHash).slice(2);
}

@Controller('buidler')
export class BuidlerController {
  constructor(private readonly buidlerService: BuidlerService) {}

  @Post()
  async create(
    @Body() createBuidlerDto: CreateBuidlerDto,
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler) {
      throw new UnauthorizedException();
    }

    if (
      buidler.status !== BuidlerStatus.ACTIVE ||
      !buidler.role.includes(BuidlerRole.Committee)
      
    ) {
      throw new BusinessException({
        message: 'You are not authorized to create a buidler',
        error_code: 'UNAUTHORIZED_TO_CREATE_BUIDLER',
      });
    }

    const address = createBuidlerDto.address;
    if (!address) {
      throw new BusinessException({
        message: 'You have to pass an address',
        error_code: 'NOT_GET_REQUIRED_ADDRESS',
      });
    }

    let newBuidler;
    const existedBuidler = await this.buidlerService.findOneByAddress(address);
    if (!existedBuidler) {
      newBuidler = await this.buidlerService.create(createBuidlerDto);
      await this.buidlerService.addBuddy(address, buidler.address);
      if (newBuidler) {
        // gen nonce
        await this.buidlerService.generateNonce(address);
      }
    } else {
      newBuidler = existedBuidler;
    }

    return {
      data: newBuidler,
    };
  }

  @Get('/getSignature')
  async getSignature(
    @Query('address') address: Address,
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler) {
      throw new UnauthorizedException();
    }

    if (!buidler.role.includes(BuidlerRole.Committee)) {
      throw new BusinessException({
        message: 'You are not committee',
        error_code: 'UNAUTHORIZED_TO_GET_SIGNATURE',
      });
    }

    const signature = await this.buidlerService.genSignature(
      ['address'],
      [address],
    );

    return {
      data: { signature },
    };
  }

  @Get('/:address/card')
  @Header('Content-Type', 'image/png')
  async card(@Param() params, @GetBuidler() buidler: Buidler, @Res() response) {
    const { address } = params;
    const result = await this.buidlerService.findByAddress(address);
    if (result?.avatar) {
      let avatarImg;
      try {
        const isExist = await existsSync(
          join(__dirname, `../../images/${address}.png`),
        );
        if (isExist) {
          avatarImg = await loadImage(
            join(__dirname, `../../images/${address}.png`),
          );
        } else {
          avatarImg = await loadImage(convertIpfsGateway(result.avatar));
          const canvasSave = createCanvas(avatarImg.width, avatarImg.height);
          const ctxSave = canvasSave.getContext('2d');
          ctxSave.drawImage(avatarImg, 0, 0);
          writeFileSync(
            join(__dirname, `../../images/${address}.png`),
            canvasSave.toBuffer(),
          );
        }
      } catch (error) {
        console.log(error);
      }
      const canvas = createCanvas(601, 332);
      const ctx = canvas.getContext('2d');
      const cardImg = await loadImage(join(__dirname, '../../images/card.png'));
      ctx.drawImage(cardImg, 0, 0);

      ctx.fillStyle = '#fff';
      //fontStyle fontWeight fontSize fontFamily
      ctx.font = '1000 24px verdana';
      ctx.fillText(capitalize(result.name), 140, 264);

      try {
        const x = 40,
          y = 216,
          w = 76,
          h = 76,
          borderRadius = 38;
        const r = Math.min(borderRadius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.clip();
        ctx.drawImage(avatarImg, x, y, w, h);
        ctx.closePath();
      } catch (error) {
        console.log(error);
      }

      const stream = canvas.createPNGStream();
      return stream.pipe(response);
    } else {
      // todo kahn generate card based on the information
      const file = createReadStream(join(__dirname, '../../images/card.png'));
      return file.pipe(response);
    }
  }

  @Get()
  async list(
    @Query() filters: BuidlerFilters,
    @GetBuidler() buidler: Buidler,
  ): Promise<ResponseData<Buidler[]>> {
    const currentPage = filters.page || 1;
    const perPage = filters.per_page || 9;
    const skip = (currentPage - 1) * perPage;

    // todo more filters logic, like sorting, etc

    // where condition supports name and role
    const buidlers = await this.buidlerService.findAll(
      filters.search,
      filters.role,
      filters.skill,
      filters.status,
      {
        skip,
        take: perPage,
      },
    );
    const total = buidlers.length;

    return {
      data: buidlers,
      pagination: {
        total,
        current: currentPage,
        per_page: perPage,
      },
    };
  }

  @Get('/:address/nonce')
  async nonce(
    @Param('address') address: Address,
  ): Promise<ResponseData<Nonce>> {
    const buidler = await this.buidlerService.findOneByAddress(address);

    const nonce = buidler?.nonce;

    return {
      data: {
        signature_message: `${SIGNIN_MESSAGE} Nonce: ${nonce}.`,
        nonce,
      },
    };
  }

  @Get('/:address')
  async findByAddress(@Param('address') address: Address) {
    if (!address) {
      throw new BusinessException({
        message: 'Param `address` is null or undefined',
        error_code: 'ERROR_PARAM',
      });
    }
    const result = await this.buidlerService.findByAddress(address);
    return {
      data: result,
    };
  }

  @Get('/:address/mates')
  async findMatesByAddress(@Param('address') address: Address) {
    if (!address) {
      throw new BusinessException({
        message: 'Param `address` is null or undefined',
        error_code: 'ERROR_PARAM',
      });
    }
    const result = await this.buidlerService.findMatesByAddress(address);
    return {
      data: result,
    };
  }

  @Post('/:address/uploadIPFS')
  async uploadIPFS(
    @Param('address') address: Address,
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler.role.includes(BuidlerRole.Committee)) {
      throw new BusinessException({
        message: 'You are not committee',
        error_code: 'UNAUTHORIZED_TO_GET_SIGNATURE',
      });
    }

    const result = await this.buidlerService.findByAddress(address);
    const metadata = getMetadata(result);
    // upload to ipfs
    const ipfsURI = await storeBuidlerMetaData(metadata);

    // update ipfsURI
    const dbBuidler = await this.buidlerService.updateIPFS(address, ipfsURI);

    return {
      data: dbBuidler,
    };
  }

  @Post('/:address/enableMint')
  async enableMint(
    @Param('address') address: Address,
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler) {
      throw new UnauthorizedException();
    }
    if (!buidler.role.includes(BuidlerRole.Committee)) {
      throw new BusinessException({
        message: 'You are not committee',
        error_code: 'UNAUTHORIZED_TO_GET_SIGNATURE',
      });
    }

    const newBuidler = await this.buidlerService.findByAddress(address);
    if (newBuidler.status != BuidlerStatus.PENDING) {
      throw new BusinessException({
        message: 'Cannot execute without `PENDING` status',
        error_code: 'ERROR_STATUS',
      });
    }

    // todo check if the current buidler is their buddy

    return await this.buidlerService.updateStatus(
      newBuidler.id,
      BuidlerStatus.READYTOMINT,
    );
  }

  @Post('/:address/syncInfo')
  async syncOnChain(
    @Param('address') address: Address,
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler) {
      throw new UnauthorizedException();
    }
    if (address !== buidler.address) {
      throw new BusinessException({
        message: 'You are not authorized to get sync info',
        error_code: 'UNAUTHORIZED_TO_SYNC_BUIDLER',
      });
    }

    // todo upgrade to base58
    const dbBuidler = await this.buidlerService.findOneByAddress(address);
    const bytes = ipfsToBytes(dbBuidler.ipfsURI);
    const signature = await this.buidlerService.genSignature(
      ['bytes', 'address'],
      [bytes, address],
    );

    return {
      data: {
        signature,
        ipfsURI: dbBuidler.ipfsURI,
      },
    };
  }

  @Post('/setStatus')
  async setStatus(
    @Body() dto: UpdateBuidlerStatusDto,
    @GetBuidler() buidler: Buidler,
  ) {
    if (!buidler) {
      throw new UnauthorizedException();
    }

    if (!buidler.role.includes(BuidlerRole.Committee)) {
      throw new BusinessException({
        message: 'You are not authorized to set buidler status',
        error_code: 'UNAUTHORIZED_TO_SET_STATUS',
      });
    }

    const dbBuidler = await this.buidlerService.findOne(dto.id);

    if (dto.status == BuidlerStatus.ACTIVE) {
      if (
        !(
          dbBuidler.status == BuidlerStatus.PENDING ||
          dbBuidler.status == BuidlerStatus.SUSPENDED ||
          dbBuidler.status == BuidlerStatus.ARCHIVED
        )
      ) {
        throw new BusinessException({
          message: 'The buidler cannot be set to `ACTIVE` now.',
          error_code: 'UNABLE_TO_SET_BUIDLER_STATUS',
        });
      }
    } else if (dto.status == BuidlerStatus.SUSPENDED) {
      if (dbBuidler.status != BuidlerStatus.ACTIVE) {
        throw new BusinessException({
          message: 'The buidler cannot be set to `SUSPENDED` now.',
          error_code: 'UNABLE_TO_SET_BUIDLER_STATUS',
        });
      }
    } else if (dto.status == BuidlerStatus.ARCHIVED) {
      if (dbBuidler.status != BuidlerStatus.ACTIVE) {
        throw new BusinessException({
          message: 'The buidler cannot be set to `ARCHIVED` now.',
          error_code: 'UNABLE_TO_SET_BUIDLER_STATUS',
        });
      }
    } else {
      throw new BusinessException({
        message: 'error input status.',
        error_code: 'ERROR_STATUS',
      });
    }
    return await this.buidlerService.updateStatus(dto.id, dto.status);
  }

  @Post('/activate')
  async activate(@GetBuidler() buidler: Buidler) {
    if (!buidler) {
      throw new UnauthorizedException();
    }
    const dbBuidler = await this.buidlerService.findOne(buidler.id);
    if (dbBuidler.status != BuidlerStatus.READYTOMINT) {
      throw new BusinessException({
        message: 'Cannot execute without `READYTOMINT` status',
        error_code: 'ERROR_STATUS',
      });
    }
    // todo: check status on chain is `PENDING`

    return await this.buidlerService.updateStatus(
      dbBuidler.id,
      BuidlerStatus.ACTIVE,
    );
  }

  @Post('/archive')
  async archive(@GetBuidler() buidler: Buidler) {
    const dbBuidler = await this.buidlerService.checkActiveStatus(buidler);
    return await this.buidlerService.updateStatus(
      dbBuidler.id,
      BuidlerStatus.ARCHIVED,
    );
  }

  @Put('/:address')
  async update(
    @Param() params,
    @Body() updateBuidlerDto: UpdateBuidlerDto,
    @GetBuidler() buidler: Buidler,
  ) {
    const { address } = params;
    //if the avatar exists then delete avatar before update
    const isExist = await existsSync(
      join(__dirname, `../../images/${address}.png`),
    );

    if (isExist) {
      unlinkSync(join(__dirname, `../../images/${address}.png`));
    }

    // todo onboarding committee can update the builder profile
    if (address !== buidler.address) {
      throw new BusinessException({
        message: 'You are not authorized to update buidler',
        error_code: 'UNAUTHORIZED_TO_UPDATE_BUIDLER',
      });
    }

    // todo error handling

    // update db first, then update ipfs with data from db, then update ipfsURI
    const dbBuidler = await this.buidlerService.findByAddress(address);
    if (
      dbBuidler.buddies.length === 0 &&
      updateBuidlerDto.metaData.buddyAddress
    ) {
      // get buddy and update
      const buddy = await this.buidlerService.findOneByAddress(
        updateBuidlerDto.metaData.buddyAddress,
      );
      if (!buddy) {
        throw new BusinessException({
          message: 'Not found your buddy',
          error_code: 'NOT_FOUND_YOUR_BUDDY',
        });
      }

      await this.buidlerService.addBuddy(address, buddy.address);
    }

    await this.buidlerService.update({
      metaData: {
        ...updateBuidlerDto.metaData,
        address,
      },
    });

    const updatedBuidler = await this.buidlerService.findByAddress(address);

    // upload to ipfs
    const ipfsURI = await storeBuidlerMetaData(getMetadata(updatedBuidler));

    // update ipfsURI
    await this.buidlerService.updateIPFS(address, ipfsURI);

    return {
      data: {
        buidler: {
          ...updatedBuidler,
          ipfsURI,
        },
      },
    };
  }

  @Post('/:address/signature')
  async signature(@Param() params, @GetBuidler() buidler: Buidler) {
    const { address } = params;
    // todo onboarding committee can update the builder profile
    if (address !== buidler.address) {
      throw new BusinessException({
        message: 'You are not authorized to update buidler',
        error_code: 'UNAUTHORIZED_TO_UPDATE_BUIDLER',
      });
    }

    // todo error handling

    // update db first, then update ipfs with data from db, then update ipfsURI
    const dbBuidler = await this.buidlerService.findByAddress(address);

    // upload to ipfs
    const ipfsURI = dbBuidler.ipfsURI;
    const bytes = ipfsToBytes(ipfsURI);

    // todo generate a mint signature for the new joiner
    const signature = await this.buidlerService.genSignature(
      ['bytes', 'address'],
      [bytes, address],
    );

    return {
      data: {
        signature,
      },
    };
  }
}
