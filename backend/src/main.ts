import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);

    console.log(process.env.DB_NAME);
    console.log(process.env.USER);
    console.log(process.env.PASSWORD);
}
bootstrap();
