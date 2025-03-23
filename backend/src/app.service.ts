import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return "Bienvenu à sur le serveur de l'application!";
  }
}
