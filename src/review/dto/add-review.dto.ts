import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AddReviewDto {
  @ApiProperty({
    description: 'Rating given to the dish (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional review comment',
    example: 'The burger was really tasty and fresh!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'ID of the dish being reviewed',
    example: 101,
  })
  @IsInt()
  dishId: number;

  @ApiProperty({
    description: 'ID of the order associated with the review',
    example: 5001,
  })
  @IsInt()
  orderId: number;
}
