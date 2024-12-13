import { Module } from '@nestjs/common';
import { AuthCoreModule } from 'src/auth-core/auth-core.module';

// SharedModule
@Module({
    imports: [
        AuthCoreModule,
        // AccountsModule,
        // TypeOrmExModule.forCustomRepository([ProfileRepository]),
        // TypeOrmModule.forFeature([Profile]),
        // JwtModule.registerAsync(jwtConfig.asProvider()),
        // ConfigModule.forFeature(jwtConfig),
    ],
    controllers: [],
    providers: [
        // CustomLoggerService,
        //  ProfileService,
        //   JwtService,
        //    TokenService
    ],
    exports: [],
})
export class SharedModule {
}
