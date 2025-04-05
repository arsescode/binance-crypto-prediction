import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { CryptoService } from './services/crypto.service';
import { CryptoController } from './controllers/crypto.controller';
@Module({
  imports: [HttpModule],
  controllers: [AppController, CryptoController],
  providers: [AppService , CryptoService],
})
export class AppModule {}
