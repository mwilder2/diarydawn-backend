import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
    return {
        secret: process.env.JWT_SECRET,
        resetTokenSecret: process.env.JWT_RESET_TOKEN_SECRET,
        audience: process.env.JWT_TOKEN_AUDIENCE,
        issuer: process.env.JWT_TOKEN_ISSUER,
        // accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
        accessTokenTtl: parseInt('3600', 10),
        // refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '86400', 10),
        refreshTokenTtl: parseInt('86400', 10),
        // resetTokenTtl: parseInt(process.env.JWT_RESET_TOKEN_TTL ?? '1800', 10), // 30 minutes by default
        resetTokenTtl: parseInt('1800', 10), // 30 minutes by default

    };
});
