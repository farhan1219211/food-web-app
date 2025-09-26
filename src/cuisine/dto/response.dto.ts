import { ApiProperty } from '@nestjs/swagger';

export class CuisineResponseDto {
  @ApiProperty({ example: '1', description: 'Unique identifier of the cuisine' })
  id: number;

  @ApiProperty({ example: 'Italian', description: 'Name of the cuisine' })
  name: string;
}
