import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'newSecurePassword123!',
    description: '새 비밀번호 (최소 6자)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
