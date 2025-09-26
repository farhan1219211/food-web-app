import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'farhan121921@gmail.com' })
    @IsEmail()
    email: string;
}
