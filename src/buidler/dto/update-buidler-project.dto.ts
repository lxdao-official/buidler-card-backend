import { IsNumber, IsString } from 'class-validator';

export class UpdateBuidlerProjectDto {
  @IsNumber()
  id: number;

  @IsString()
  ipfsURI: string;

  @IsString()
  projectName: string;
}
