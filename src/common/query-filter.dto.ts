import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

enum Sort {
  created_at,
  updated_at,
}

export class CommonFilters {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  per_page?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  order?: Sort;
}
