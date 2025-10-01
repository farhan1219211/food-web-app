import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Min } from "class-validator";

export class CreateFavouriteDto {
    @ApiProperty({
        description: 'Enter an id from menu',
        example: 1})
    @IsInt()
    id: number;
}
