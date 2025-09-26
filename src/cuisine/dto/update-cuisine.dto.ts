import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCuisineDto } from './create-cuisine.dto';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) =>
    value
      ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : value
  )
  name: string;
}
