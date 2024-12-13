import { Controller } from '@nestjs/common';

import { Auth } from '../auth-core/decorators/auth.decorator';
import { AuthType } from '../auth-core/enums/auth-type.enum';
import { EntryTypesService } from './services/entry-types.service';

@Auth(AuthType.Bearer)
@Controller('api/entry')
export class EntryTypesController {
    constructor(private readonly entryTypesService: EntryTypesService) {
    }
}
