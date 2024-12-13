import { PartialType } from '@nestjs/mapped-types';
import { UserAuthDto } from './user-auth.dto';

export class UpdateUserAuthDto extends PartialType(UserAuthDto) {
}
