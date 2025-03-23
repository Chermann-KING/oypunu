import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware pour rediriger / vers /api
  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.url === '/') {
      return res.redirect('/api');
    }
    next();
  });

  // Ajoute un préfixe global 'api' à toutes les routes
  app.setGlobalPrefix('api');

  // Active CORS pour le développement
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`L'application fonctionne sur: http://localhost:${port}`);
}
bootstrap();
