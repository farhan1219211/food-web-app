import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class ValidatateTokenDto {
  @ApiProperty({
    description: 'Email not be empty'
  })
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsEmail()
  email: string;


  @ApiProperty({
    description: 'Token must not be empty'
  })
  @IsNotEmpty({ message: 'token is required' })
  @IsString()
  token: string;
}
