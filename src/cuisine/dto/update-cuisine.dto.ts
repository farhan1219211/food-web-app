import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCuisineDto } from './create-cuisine.dto';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCuisineDto extends PartialType(CreateCuisineDto) {
  @ApiProperty({
    example: 'Mexican',
    description: 'Updated cuisine name',
    required: true,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}
