import { Body, Controller, Delete, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login-auth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ValidatateTokenDto } from './dto/validate-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Guard } from './guard/guard.guard';
import { Roles } from './guard/role/role.decorator';
import { Role } from 'src/common/enum/role.enum';

@ApiTags()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}


    // login customer
    @Post('login')
    @ApiOperation({
    summary: 'Login ',
    description: 'Authenticate a user using email and password.',
     })
    loginUser(@Body() loginDto: LoginDto){
        return this.authService.loginUser(loginDto);
    }

    // logout customer
    @UseGuards(Guard)
    @Roles(Role.CUSTOMER, Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
    @Delete('logout')
    @ApiOperation({
    summary: 'Logout ',
    })
    async logout(@Req() req){
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
        throw new UnauthorizedException('Authorization header missing');
        }

        const token = authHeader.split(' ')[1]; 
        if (!token) {
        throw new UnauthorizedException('Access token missing');
        }
        console.log("acces token is: ", token);
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

    // // delete user
    // @UseGuards(Guard)
    // @Roles(Role.SUPER_ADMIN, Role.CUSTOMER, Role.RESTAURANT_ADMIN)
    // @Delete('delete-account')
    // @ApiOperation({ summary: 'Delete current logged-in user account' })
    // @ApiResponse({ status: 200, description: 'User account deleted successfully' })
    // @ApiResponse({ status: 401, description: 'Unauthorized' })
    // remove(@Req() req) {
    //     const authId = req.user.sub;
    //     return this.authService.removeAuth(authId);
    // }

    

}
