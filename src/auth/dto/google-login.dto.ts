import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Firebase Google 로그인으로 받은 ID Token' })
  @IsString()
  idToken: string;
}