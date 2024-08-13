import { Body, Controller, Get, Post } from '@nestjs/common';
import { FeatureService } from './feature.service';

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  async grantAccessToFeature(@Body() { userId, featureId }) {
    return this.featureService.grantAcessToFeature(userId, featureId);
  }
}
