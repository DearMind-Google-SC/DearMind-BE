import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'test@example.com',
    description: '비밀번호 재설정 메일을 받을 이메일 주소',
  })
  @IsEmail()
  email: string;
}
