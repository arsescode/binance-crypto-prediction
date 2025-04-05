import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CryptoService } from '../services/crypto.service';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('prediction/:symbol')
  getPrediction(@Param('symbol') symbol: string) {
    try {
      return this.cryptoService.getPrediction(symbol);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('coins')
  getAllPredictions() {
    return this.cryptoService.getAllCoins();
  }

}
