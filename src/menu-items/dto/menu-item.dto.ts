import { IsInt, IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsUrl, MinLength, Min, IsNotEmpty } from 'class-validator';
import { PickType, PartialType, OmitType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MenuItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Burger' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Delicious chicken burger' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  restaurantId: number;

  @ApiPropertyOptional({ example: 3 })
  @IsNotEmpty()
  @IsInt()
  cuisineId: number;

  @ApiProperty({ example: '2025-09-25T12:00:00Z' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ example: '2025-09-25T12:30:00Z' })
  @IsDate()
  updatedAt: Date;
}








