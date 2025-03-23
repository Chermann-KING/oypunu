import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get()
  getHello(): string {
    return this._appService.getHello();
  }

  // Une route test pour l'API
  @Get('test')
  testApi(): object {
    return { message: "L'API fonctionne!" };
  }
}
