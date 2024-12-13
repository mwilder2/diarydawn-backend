import {
    Body,
    Controller,
    Get,
    Headers,
    Put,
} from '@nestjs/common';
import { Auth } from 'src/auth-core/decorators/auth.decorator';
import { AuthType } from 'src/auth-core/enums/auth-type.enum';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';

@Auth(AuthType.Bearer)
@Controller('api/user')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Get('getuser')
    @ApiOperation({ summary: 'Retrieve user information' })
    @ApiResponse({ status: 200, description: 'The user information has been successfully retrieved.', type: User })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBearerAuth()
    async getUser(@Headers('Authorization') authorizationHeader: string) {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        return this.userService.getUser(accessToken);
    }

    @Put('changepassword')
    @ApiOperation({ summary: 'Change the password of the authenticated user' })
    @ApiResponse({ status: 200, description: 'The password has been successfully updated.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBearerAuth()
    async changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @Headers('Authorization') authorizationHeader: string,
    ): Promise<{ message: string }> {
        const accessToken = authorizationHeader.replace('Bearer ', '');
        await this.userService.changePassword(changePasswordDto, accessToken);
        return { message: 'Password has been changed Successfully!' };
    }

}

