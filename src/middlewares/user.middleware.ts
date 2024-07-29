import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class UserMiddleware implements NestMiddleware {
	use(req: any, res: any, next: (error?: any) => void) {
		throw new Error('Method not implemented.');
	}
	resolve(...args: any[]) {
		return (req, res, next) => {
			
			next();
		};
	}
}