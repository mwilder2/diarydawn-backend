"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuthCoreModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var core_1 = require("@nestjs/core");
var jwt_1 = require("@nestjs/jwt");
var jwt_config_1 = require("./config/jwt.config");
var access_token_guard_1 = require("./guards/access-token.guard");
var authentication_guard_1 = require("./guards/authentication.guard");
var redis_module_1 = require("../redis/redis.module");
var refresh_token_ids_storage_1 = require("./refresh-token-ids.storage");
var token_service_1 = require("./token.service");
var bcrypt_service_1 = require("./hashing/bcrypt.service");
var hashing_service_1 = require("./hashing/hashing.service");
// AuthCoreModule
var AuthCoreModule = /** @class */ (function () {
    function AuthCoreModule() {
    }
    AuthCoreModule = __decorate([
        common_1.Module({
            imports: [
                jwt_1.JwtModule.registerAsync(jwt_config_1["default"].asProvider()),
                config_1.ConfigModule.forFeature(jwt_config_1["default"]),
                redis_module_1.RedisModule,
            ],
            providers: [
                {
                    provide: hashing_service_1.HashingService,
                    useClass: bcrypt_service_1.BcryptService
                },
                {
                    provide: core_1.APP_GUARD,
                    useClass: authentication_guard_1.AuthenticationGuard
                },
                access_token_guard_1.AccessTokenGuard,
                refresh_token_ids_storage_1.RefreshTokenIdsStorage,
                token_service_1.TokenService,
            ],
            controllers: [],
            exports: [refresh_token_ids_storage_1.RefreshTokenIdsStorage, token_service_1.TokenService, hashing_service_1.HashingService, redis_module_1.RedisModule]
        })
    ], AuthCoreModule);
    return AuthCoreModule;
}());
exports.AuthCoreModule = AuthCoreModule;
