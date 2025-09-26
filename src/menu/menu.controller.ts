import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PublicMenuDto } from './dto/public-menu.dto';
import { MenuPaginationDto } from './dto/menu-pagination.dto';
import { AdminMenuPaginationDto } from './dto/admin-menu-pagination.dto';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}


  @Post('add-menu')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Add a new menu item (Restaurant Admin only)' })
  create(@GetUser() resAdmin: User,@Body() createMenuDto: CreateMenuDto){
    return this.menuService.create(resAdmin, createMenuDto);
  }


  // search menu
  @Get('search')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @ApiOperation({ summary: 'Search menu items with pagination & filters' })
  async searchMenu(@Query() query: MenuPaginationDto) {
      return await this.menuService.searchMenu(query);
  }

  // restaurant admin get his all items places inside menu
  @Get('my-menu')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get paginated menu items for the logged-in restaurant admin' })
  async getMyMenu(@GetUser() admin: User, @Query() pagination: AdminMenuPaginationDto,
  ) {
    return this.menuService.findByAdmin(admin.id, pagination);
  }


  @Patch('update/:id')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Update a menu item (Restaurant Admin only)' })
  update(
    @GetUser() resAdmin: User,
    @Param('id', ParseIntPipe) menuId: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(resAdmin, menuId, updateMenuDto);
  }

  // delete menu
  @Delete('remove/:id')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a menu item (Super Admin: any, Restaurant Admin: own only)' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.menuService.remove(id, user);
  }

}
