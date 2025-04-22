import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com', description: '이메일 주소' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123!', description: '비밀번호 (최소 6자)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  @IsString()
  name: string;
}
