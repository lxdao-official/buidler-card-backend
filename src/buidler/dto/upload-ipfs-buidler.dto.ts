import { IsString } from 'class-validator';

export class UploadIpfsBuidlerDto {
  @IsString()
  metaData: string;
}
