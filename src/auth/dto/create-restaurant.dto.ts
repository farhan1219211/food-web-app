import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength, IsEnum, IsPhoneNumber, IsNumber, IsOptional } from 'class-validator';
import { BusinessType } from '../../restaurant/enums/business-type.enum';
import { Type } from 'class-transformer';

export class CreateRestaurantDto {
  //restaurant admiin info
  @ApiProperty({
    example: 'M Malik',
    description: 'Full name of the restaurant admin',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'm.malik@citrusbits.com',
    description: 'Email of the restaurant admin',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'malik121921',
    description: 'Password for the restaurant admin',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+92 312 456789', description: 'phone number of an restaurant admin' })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123, Punjab, Pakistan' , description: 'address of an admin'})
  @IsOptional()
  address?: string;

  // profile inifo
  @ApiProperty({
    example: 'Pizza Hut',
    description: 'Official name of the restaurant',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    example: 33.66745498248082,
    description: 'Latitude of the restaurant location',
  })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({
    example: 73.07530201961603,
    description: 'Longitude of the restaurant location',
  })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiProperty({
    enum: BusinessType,
    example: [BusinessType.RESTAURANT, BusinessType.CAFE, BusinessType.HOME_KITCHEN, BusinessType.SHOP],
    description: 'Type of business',
  })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiProperty({
    example: 'Plot # 20, Time Square Plaza, I-8 Markaz I-8, Islamabad, Pakistan',
    description: 'Complete location of the restaurant',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: 'Islamabad',
    description: 'City where the restaurant is located',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: '+92 312 5223547',
    description: 'Primary phone number of the restaurant',
  })
  @IsPhoneNumber('PK')
  phoneNumber: string;

  @ApiProperty({
    example: 'REG-123456',
    description: 'Government-issued registration or license number',
  })
  @IsString()
  @IsOptional()
  registrationNumber: string;
}
