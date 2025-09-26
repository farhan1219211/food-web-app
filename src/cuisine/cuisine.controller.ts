import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBearerAuth, ApiNoContentResponse } from '@nestjs/swagger';
import { CuisineService } from './cuisine.service';
import { CreateCuisineDto } from './dto/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/update-cuisine.dto';
import { Role } from 'src/common/enum/role.enum';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { CuisinePaginationDto } from './dto/pagination.dto';



@ApiTags('Cuisine')
@Controller('cuisine')
export class CuisineController {
  constructor(private readonly cuisineService: CuisineService) {}

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Post('add-cuisine')
  @ApiOperation({ summary: 'Create a new cuisine (only super admin)' })
  create(@Body() createCuisineDto: CreateCuisineDto) {
    return this.cuisineService.create(createCuisineDto);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Get('search')
  @ApiOperation({ summary: 'Get all cuisines with pagination & search (only super admin)' })
  findAll(@Query() query: CuisinePaginationDto) {
    return this.cuisineService.findAll(query);
  }

  // @Get('get/:id')
  // @ApiOperation({ summary: 'Get a cuisine by ID' })
  // findOne(@Param('id') id: number) {
  //   return this.cuisineService.findOne(id);
  // }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Patch('update/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update a cuisine by ID (only super admin)' })
  update(@Param('id') id: number, @Body() updateCuisineDto: UpdateCuisineDto) {
    return this.cuisineService.update(id, updateCuisineDto);
  }

  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.SUPER_ADMIN)
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a cuisine by ID (only super admin)' })
   remove(@Param('id') id: number) {
    return this.cuisineService.remove(id);
  }
}
