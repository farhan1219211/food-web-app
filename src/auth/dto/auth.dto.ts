// experimental purpose (to optimize the code for dto)

import { OmitType, PickType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDate, IsEmail, IsNumber, IsString } from "class-validator";

export class AuthDto {
  @IsNumber()
  @Expose()
  id: number;

  @IsEmail()
  @Expose()
  email: string;

  @IsString()
  password: string; 

  @IsString()
  resetPasswordToken: string | null; 

  @IsDate()
  expiresAt: Date | null;
}


export class AuthResponseDto extends OmitType(AuthDto, [
    'password',
    'resetPasswordToken',
    'expiresAt'
  ]as const){}
