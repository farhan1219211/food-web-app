import { IntersectionType, OmitType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { AuthResponseDto } from "src/auth/dto/auth.dto";
import { Role } from "src/common/enum/role.enum";


export class userDto {
  @IsNumber()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  fullName: string;

  @IsString()
  @IsOptional()
  @Expose()
  address?: string;

  @IsString()
  @Expose()
  phone: string;

  @IsEnum(Role)
  @Expose()
  role: Role;

  @IsBoolean()
  @Expose()
  isActive: boolean;

  @IsString()
  @Expose()
  avatarUrl: string;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  @IsDate()
  @Expose()
  deletedAt: Date;
}


export class UserResponse extends OmitType(userDto, [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'isActive'
] as const){}

export class UserAuthResponse extends IntersectionType(
    AuthResponseDto,
    UserResponse
){}