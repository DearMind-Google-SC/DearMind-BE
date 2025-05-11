import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SaveAIChatDto {
  @ApiProperty({ example: '괜찮아요. 오늘 하루도 잘 버텨주셨어요.' })
  @IsString()
  message: string;
}