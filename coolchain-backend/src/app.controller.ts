import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get() getHello(): string {
    return this._appService.getHello();
  }
}
