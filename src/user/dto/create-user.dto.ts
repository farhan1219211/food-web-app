import { IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enum/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Farhan Javaid' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'farhan121921@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+92 312 456789' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: Role.CUSTOMER, enum: Role,  })
  @IsEnum(Role, { message: 'Invalid user role provided.' })
  role: Role;

   
  @ApiProperty({ example: '123, Punjab, Pakistan' })
  @IsOptional()
  address?: string;
}
