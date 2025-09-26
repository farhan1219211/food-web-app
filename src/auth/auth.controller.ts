import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidatateTokenDto } from './dto/validate-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Guard } from '../common/guard/guard.guard';
import { Roles } from '../common/guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UserResponse } from 'src/common/utils/user.mapper';
// import { CreateRestaurantProfileDto } from 'src/restaurant-profile/dto/profile-response';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@ApiTags()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // Create user
    @Post('signup')
    @ApiOperation({
        summary: 'Create a new user account (automatically assigned the customer role)',
    })
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponse> {
        return this.authService.createUser(createUserDto, Role.CUSTOMER);
    }

    @ApiBearerAuth()
    @UseGuards(Guard)
    @Roles(Role.SUPER_ADMIN)
    @Post('add-restaurant')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Create restaurant admin and profile (only super admin)' })
    async createRestaurantAdmin( @Body()  dto: CreateRestaurantDto, @GetUser('email') superAdminEmail: string): Promise<void> {
        await this.authService.createRestaurantAdmin(dto, superAdminEmail);
    }

    // create super admin account
    @ApiBearerAuth()
    @UseGuards(Guard)
    @Roles(Role.SUPER_ADMIN)
    @Post('add-super-admin')
    @ApiOperation({ summary: 'Create super admin account (only super admin)' })
    async createSuperAdmin(
        @Body() createUserDto: CreateUserDto,
        @GetUser('email') email: string,
    ): Promise<UserResponse> {
        return this.authService.createSuperAdmin(createUserDto, email, Role.SUPER_ADMIN);
    }

    // login customer
    @Post('login')
    @ApiOperation({
        summary: 'Login ',
        description: 'Authenticate a user using email and password.',
    })
    loginUser(@Body() loginDto: LoginDto) {
        return this.authService.loginUser(loginDto);
    }

    // logout customer
    @ApiBearerAuth()
    @UseGuards(Guard)
    @Roles(Role.CUSTOMER, Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
    @Delete('logout')
    @ApiOperation({
        summary: 'Logout ',
    })
    async logout(@GetUser('token') token: string) {
        return this.authService.logout(token);
    }

    // forgot password
    @Post('forgot-password')
    @ApiOperation({
        summary: 'Forgot password',
        description:
            'Initiates password reset by sending a reset token to the user’s registered email address.',
    })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    // validate the request
    @Post('validate-reset-request')
    @ApiOperation({
        summary: 'Validate reset token',
        description:
            'Validates whether the provided reset token for a given email is valid and active.',
    })
    validateResetToken(@Body() validateTokenDto: ValidatateTokenDto) {
        return this.authService.validateResetToken(validateTokenDto);
    }

    // reset password
    @Post('reset-password')
    @ApiOperation({
        summary: 'Reset password',
        description:
            'Resets the password for the user’s account if a valid token and email are provided.',
    })
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
