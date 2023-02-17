import { IsArray, IsNumber, IsString, IsObject } from 'class-validator';
import { Buidler, BuidlerStatus } from '@prisma/client';
import { Address } from 'src/types';

export class UpdateBuidlerMetaData {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsString()
  image?: string;

  @IsString()
  avatar?: string;

  @IsString()
  role?: string[];

  @IsString()
  address?: string;

  @IsString()
  ipfsURI?: string;

  @IsString()
  buddyAddress?: Address;

  @IsString()
  buddy?: Buidler;

  @IsArray()
  skills?: [];

  @IsArray()
  interests?: [];

  @IsArray()
  contacts?: [];

  @IsObject()
  privateContacts?: {
    email?: string;
  };
}

export class UpdateBuidlerDto {
  metaData: UpdateBuidlerMetaData;
}

export class UpdateBuidlerStatusDto {
  @IsNumber()
  id: number;

  status: BuidlerStatus;
}
