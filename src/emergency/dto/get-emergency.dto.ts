import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetNearbyCentersDto {
  @ApiProperty({ example: 37.5665 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 126.9780 })
  @IsNumber()
  longitude: number;
}