import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2ZGY...',
    description: 'Firebase에서 발급받은 ID 토큰',
  })
  @IsString()
  idToken: string;
}
