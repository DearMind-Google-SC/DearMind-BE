import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class SaveRewardImageDto {
  @ApiProperty({ description: 'base64로 인코딩된 이미지', example: 'data:image/png;base64,...' })
  @IsString()
  image: string;

  @ApiProperty({ description: 'AI가 생성한 편지 텍스트', example: 'You did great! Keep going!' })
  @IsString()
  letter: string;

  @ApiProperty({ description: '이미지 지급 시 streak 값', example: 3 })
  @IsInt()
  @Min(1)
  streak: number;
}