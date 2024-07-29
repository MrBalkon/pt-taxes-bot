import { Module } from '@nestjs/common';
import { SeleniumService } from './selenium.service';

@Module({
	controllers: [],
	providers: [SeleniumService],
	exports: [SeleniumService],
})
export class SeleniumModule {};