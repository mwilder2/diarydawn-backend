import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthServiceModule } from './auth-service/auth-service.module';
import { getEnvPath } from './common/helpers/env.helper';
import { TypeOrmConfigService } from './common/typeorm/typeorm-config.service';
import { ThrottlerModule } from '@nestjs/throttler';

const envFilePath: string = getEnvPath();

// AppModule
@Module({
  imports: [
    AuthServiceModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [],
  providers: [ConfigService],
})
export class AppModule { }

// ▪ Terminal - Set NEST_DEBUG to true, then fire up the application again (port 3000)
// npm run start:dev NEST_DEBUG=true

// ▪ Terminal - Use Madge to look for circular dependencies
// npx madge dist/main.js --circular

// To generate image of graph
// npx madge dist/main.js --image graph.png

// Nest.js TypeORM migrations

// Step 1:
// npm run typeorm migration:generate -- -n MigrationNameHere

// Step 2:
// npm run typeorm migration:run

/^ OPTIONAL TO REVERT */
// Step 3:
// npm run typeorm migration:revert

// Swagger
// http://localhost:3000/api
