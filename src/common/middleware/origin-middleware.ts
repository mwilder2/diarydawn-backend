// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class OriginMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction): void {
//     if (!req.headers.origin) {
//       req.headers.origin = 'https://diarydawn.com';  // Set a default origin if none is provided
//     }
//     next();
//   }
// }