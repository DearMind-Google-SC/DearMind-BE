import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { RewardStyle } from '../enums/reward-style.enum';

export class SaveRewardImageDto {
  @ApiProperty({ description: 'base64로 인코딩된 이미지', example: 'data:image/png;base64,...' })
  @IsString()
  image: string;

  @ApiProperty({ description: '이미지 지급 시 streak 값', example: 3 })
  @IsInt()
  @Min(1)
  streak: number;

  @ApiProperty({ description: 'AI가 생성한 편지 텍스트', example: 'You’ve done a great job!' })
  @IsString()
  letter: string;

  @ApiPropertyOptional({
    description: '사용자가 선택한 그림 스타일 (선택사항)',
    enum: RewardStyle,
    example: RewardStyle.WATERCOLOR,
  })
  @IsOptional()
  @IsEnum(RewardStyle)
  style?: RewardStyle;
}