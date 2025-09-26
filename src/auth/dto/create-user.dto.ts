import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty({ example: '123, Punjab, Pakistan' })
    @IsOptional()
    address?: string;
}
