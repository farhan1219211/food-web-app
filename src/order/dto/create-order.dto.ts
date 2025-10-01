import { IsNotEmpty, IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @ApiProperty({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

}
