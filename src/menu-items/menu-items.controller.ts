import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, Query } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Guard } from 'src/common/guard/guard.guard';
import { Roles } from 'src/common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PublicMenuItemDto } from './dto/public-menu-items.dto';
import { MenuItemPaginationDto } from './dto/menu-item-pagination.dto';
import { AdminMenuPaginationDto } from './dto/admin-menu-pagination.dto';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}


  @Post('add-menu')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Add a new menu item (Restaurant Admin only)' })
  create(@GetUser() resAdmin: User,@Body() createMenuItemDto: CreateMenuItemDto){
    return this.menuItemsService.create(resAdmin, createMenuItemDto);
  }


  // search menu
  @Get('search')
  @ApiOperation({ summary: 'Search menu items with pagination & filters' })
  async searchMenu(@Query() query: MenuItemPaginationDto) {
      return await this.menuItemsService.searchMenu(query);
  }

  // restaurant admin get his all items places inside menu
  @Get('my-menu')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get paginated menu items for the logged-in restaurant admin' })
  async getMyMenu(@GetUser() admin: User, @Query() pagination: AdminMenuPaginationDto,
  ) {
    return this.menuItemsService.findByAdmin(admin.id, pagination);
  }


  @Patch('update/:id')
  @ApiBearerAuth()
  @UseGuards(Guard)
  @Roles(Role.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Update a menu item (Restaurant Admin only)' })
  update(
    @GetUser() resAdmin: User,
    @Param('id', ParseIntPipe) menuId: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(resAdmin, menuId, updateMenuItemDto);
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
    return this.menuItemsService.remove(id, user);
  }

}
