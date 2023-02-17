import { Injectable, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from 'src/prisma.service';
import { Address } from 'src/types';
import { CreateBuidlerDto } from './dto/create-buidler.dto';
import { UpdateBuidlerDto } from './dto/update-buidler.dto';
import {
  Buidler,
  BuidlerOnProjectStatus,
  BuidlerStatus,
  Prisma,
} from '@prisma/client';
import { ethers } from 'ethers';
import { BusinessException } from '../common/business.exception';

const getNonce = () => {
  return uuidv4();
};

@Injectable()
export class BuidlerService {
  constructor(private prisma: PrismaService) {}

  async genSignature(types: string[], values: any[]) {
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(types, values),
    );
    const signerWallet = new ethers.Wallet(
      process.env.SIGNER_WALLET_PRIVATE_KEY,
    );
    const message = ethers.utils.arrayify(hash);
    return await signerWallet.signMessage(message);
  }

  async checkActiveStatus(buidler: Buidler) {
    if (!buidler) {
      throw new UnauthorizedException();
    }
    const id = buidler.id;
    const dbBuidler = await this.findOne(id);
    if (dbBuidler.status != BuidlerStatus.ACTIVE) {
      throw new BusinessException({
        message: 'Cannot execute without `ACTIVE` status',
        error_code: 'ERROR_STATUS',
      });
    }
    return dbBuidler;
  }

  async create(createBuidlerDto: CreateBuidlerDto) {
    return await this.prisma.buidler.create({
      data: {
        role: ['Buidler'],
        address: createBuidlerDto.address,
      },
    });
  }

  async findAll(
    search?: string,
    role?: string,
    skill?: string,
    status?: string,
    params?: {
      skip?: number;
      take?: number;
      cursor?: Prisma.BuidlerWhereUniqueInput;
      where?: Prisma.BuidlerWhereInput;
      orderBy?: Prisma.BuidlerOrderByWithRelationInput;
    },
  ) {
    const find = {
      ...params,
      include: {
        projects: {
          include: { project: true },
        },
      },
    };

    const statusWhere = {};
    if (status && status.length > 0) {
      statusWhere['equals'] = status;
    } else {
      statusWhere['not'] = status;
    }

    const where = {
      status: statusWhere,
    };

    const orWhere = [];
    if (search && search.length > 0) {
      if (search.startsWith('0x') && search.length === 42) {
        orWhere.push({
          address: {
            contains: search,
            mode: 'insensitive',
          },
        });
      } else {
        orWhere.push({
          name: {
            contains: search,
            mode: 'insensitive',
          },
        });
      }
    }

    if (orWhere.length > 0) {
      where['OR'] = orWhere;
    }
    if (role) {
      where['role'] = {
        has: role,
      };
    }
    if (skill) {
      where['AND'] = [
        {
          OR: [
            {
              skills: {
                array_contains: [{ name: skill, level: 'Senior' }],
              },
            },
            {
              skills: {
                array_contains: [{ name: skill, level: 'Junior' }],
              },
            },
            {
              skills: {
                array_contains: [{ name: skill, level: 'Intermediate' }],
              },
            },
          ],
        },
      ];
    }
    find['where'] = where;
    return await this.prisma.buidler.findMany(find);
  }

  async findOne(id: number) {
    const record = await this.prisma.buidler.findUnique({
      where: {
        id,
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });
    if (!record) {
      throw new BusinessException({
        message: `Cannot find id:${id}`,
        error_code: 'CANNOT_FIND_ID',
      });
    }
    return record;
  }

  async findByAddress(address: Address) {
    const record = await this.prisma.buidler.findUnique({
      where: {
        address,
      },
      include: {
        lxPoints: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        projects: {
          include: {
            project: true,
          },
        },
        buddies: true,
      },
    });
    if (!record) {
      throw new BusinessException({
        message: `Cannot find address:${address}`,
        error_code: 'CANNOT_FIND_ADDRESS',
      });
    }

    return record;
  }

  async findMatesByAddress(address: Address) {
    const record = await this.prisma.buidler.findMany({
      take: 100,
      where: {
        buddies: {
          some: {
            address: address,
          },
        },
      },
    });
    if (!record) {
      throw new BusinessException({
        message: `Cannot find address:${address}`,
        error_code: 'CANNOT_FIND_ADDRESS',
      });
    }

    return record;
  }

  async update(dto: UpdateBuidlerDto) {
    const updatedAt = new Date().toISOString();
    const skills = dto.metaData.skills as Prisma.JsonArray;
    const contacts = dto.metaData.contacts as Prisma.JsonArray;
    return await this.prisma.buidler.update({
      where: { address: dto.metaData.address },
      data: {
        updatedAt: updatedAt,
        name: dto.metaData.name,
        description: dto.metaData.description,
        image: dto.metaData.image,
        avatar: dto.metaData.avatar,
        role: dto.metaData.role,
        skills: skills,
        interests: dto.metaData.interests,
        contacts: contacts,
        ipfsURI: dto.metaData.ipfsURI,
        privateContacts: dto.metaData.privateContacts,
      },
    });
  }

  async updateIPFS(toAddress, ipfsURI) {
    return await this.prisma.buidler.update({
      where: { address: toAddress },
      data: {
        ipfsURI,
      },
    });
  }

  async addBuddy(toAddress, buddyAddress) {
    return await this.prisma.buidler.update({
      where: { address: toAddress },
      data: {
        buddies: {
          connect: {
            address: buddyAddress,
          },
        },
      },
    });
  }

  async updateStatus(id: number, status: BuidlerStatus) {
    const now = new Date().toISOString();

    return await this.prisma.buidler.update({
      where: { id: id },
      data: {
        status,
        updatedAt: now,
      },
    });
  }

  async findBuidlerOnProject(projectId: number, buidlerId: number) {
    return await this.prisma.buidlerOnProject.findFirst({
      where: {
        projectId: projectId,
        buidlerId: buidlerId,
        deletedAt: null,
      },
    });
  }

  async createBuidlerProject(
    buidlerId: number,
    projectId: number,
    startDate?: string,
    endDate?: string,
    roles?: string[],
  ) {
    // exist
    await this.findOne(buidlerId);

    const project = await this.prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) {
      throw new BusinessException({
        message: `Cannot find project:${projectId}`,
        error_code: 'CANNOT_FIND_PROJECT',
      });
    }

    const record = await this.prisma.buidlerOnProject.findFirst({
      where: {
        projectId: projectId,
        buidlerId: buidlerId,
        deletedAt: null,
      },
    });
    if (record && record.status == BuidlerOnProjectStatus.PENDING) {
      throw new BusinessException({
        message: `The invitation has existed`,
        error_code: 'EXISTED_INVITATION',
      });
    }
    if (record && record.status == BuidlerOnProjectStatus.ACTIVE) {
      throw new BusinessException({
        message: `Buidler exist in the project`,
        error_code: 'EXIST_IN_PROJECT',
      });
    }

    const now = new Date().toISOString();

    return await this.prisma.buidlerOnProject.create({
      data: {
        projectId: projectId,
        buidlerId: buidlerId,
        projectRole: roles,
        startedAt: startDate ? new Date(startDate).toISOString() : now,
        endedAt: endDate ? new Date(endDate).toISOString() : null,
      },
    });
  }

  async getNonce(address: Address) {
    const user = await this.findOneByAddress(address);
    if (!user) {
      throw new Error('User not found');
    }
    return user.nonce;
  }

  async generateNonce(address: Address) {
    return this.prisma.buidler.update({
      where: {
        address,
      },
      data: {
        nonce: getNonce(),
      },
    });
  }

  async findOneByAddress(address: Address) {
    return await this.prisma.buidler.findFirst({
      where: {
        address: address,
      },
    });
  }

  async findProjectById(id: number) {
    const project = await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: { buidlersOnProject: { include: { buidler: true } } },
    });
    return project;
  }
}
