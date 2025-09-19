import { Type } from 'class-transformer';
import { IsInt, IsIn, IsOptional, Min, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from 'src/common/enum/role.enum';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (must be ≥ 1)',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page (only 10 or 20 allowed)',
    enum: [10, 20],
    example: 10,
    default: 10,
  })
  @IsInt()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by role (Super Admin only)',
    enum: [Role.SUPER_ADMIN, Role.RESTAURANT_ADMIN, Role.CUSTOMER],
    example: Role.CUSTOMER,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Role, {message: 'Invalid User Role Provided'})
  role?: Role;

  @ApiPropertyOptional({
    description: 'Search by full name, phone or address',
    example: 'junaid',
    nullable: true,
  })
  @IsOptional()
  search?: string;
}
