import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthCoreModule } from 'src/auth-core/auth-core.module';
import jwtConfig from '../auth-core/config/jwt.config';
import { ProfileController } from './profile.controller';
import { ProfileService } from './services/profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from '../common/typeorm/typeorm-ex.module';
import { Profile } from './entities/profile.entity';
import { ProfileRepository } from './profile.repository';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { UserModule } from '../user/user.module';
import { SharingModule } from 'src/sharing/sharing.module';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';

// ProfileModule
@Module({
    imports: [
        AuthCoreModule,
        UserModule,
        SharingModule,
        TypeOrmExModule.forCustomRepository([ProfileRepository]),
        TypeOrmModule.forFeature([Profile]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(jwtConfig),
        MulterModule.register({
            storage: multer.diskStorage({
                destination: './uploads',  // or another path, depending on your setup
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    cb(null, uniqueSuffix + '-' + file.originalname);
                }
            })
        }),
    ],
    controllers: [ProfileController],
    providers: [ProfileService, CustomLoggerService,],
    exports: [ProfileService, UserModule],
})
export class ProfileModule {
}


// MulterModule.register({
//     storage: multer.diskStorage({
//         destination: './uploads',  // or another path, depending on your setup
//         filename: (req, file, cb) => {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//             cb(null, uniqueSuffix + '-' + file.originalname);
//         }
//     })
// }),