import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BINANCE_API_URL } from '../config/const.config';
import { BinanceSymbolMiniModel, BinanceCoinModel } from 'src/models/binance/binance-coin.model';
import { CoinDto } from 'src/models/dto/coin-dto.model';
import { CoinPredictionDto } from 'src/models/dto/coin-prediction-dto.model';
@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private coinsData: Map<string, BinanceCoinModel> = new Map();
  private readonly updateInterval = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly httpService: HttpService) {

    this.updateCoinData();
    

    setInterval(() => this.updateCoinData(), this.updateInterval);
  }

  async updateCoinData(): Promise<void> {
    try {
      this.logger.log('Updating Coin data for top 100 coins...');
      const topCoins: BinanceCoinModel[] = await this.getTopCoins();
      
      for (const coin of topCoins) {
        this.coinsData.set(coin.baseAsset, coin);
        this.logger.debug(`Updated ${coin.baseAsset} Price: ${coin.lastPrice}`);
      }
      
      this.logger.log(`RSI data updated for ${topCoins.length} coins`);
    } catch (error) {
      this.logger.error(`Error updating RSI data: ${error.message}`);
    }
  }

  async getTopCoins(): Promise<BinanceCoinModel[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${BINANCE_API_URL}/api/v3/ticker/24hr?type=MINI`)
      );
      
      const usdtPairs: BinanceSymbolMiniModel[] = response.data
        .filter(ticker => ticker.symbol.endsWith('USDT'))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice(0, 100);
      
      return usdtPairs.map(pair => ({
        baseAsset: pair.symbol.replace('USDT', ''),
        ...pair
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch top coins: ${error.message}`);
      throw error;
    }
  }

  async calculateRSI(symbol: string, period: number = 14): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${BINANCE_API_URL}/api/v3/klines`, {
          params: {
            symbol: symbol,
            interval: '1h',
            limit: period + 50
          }
        })
      );

      const closes = response.data.map(candle => parseFloat(candle[4]));
      return this.computeRSI(closes, period);
    } catch (error) {
      this.logger.error(`Failed to calculate RSI for ${symbol}: ${error.message}`);
      throw error;
    }
  }

  computeRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) {
      throw new Error('Not enough data points to calculate RSI');
    }

    // Calculate price changes
    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Calculate average gains and losses
    let gains = 0;
    let losses = 0;

    // First period
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) {
        gains += changes[i];
      } else {
        losses += Math.abs(changes[i]);
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate subsequent values using the smoothed method
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }

    // Calculate RS and RSI
    if (avgLoss === 0) {
      return 100; // Avoid division by zero
    }
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return parseFloat(rsi.toFixed(2));
  }

  async getPrediction(coinName: string): Promise<CoinPredictionDto> {

    const normalizedCoinName = coinName.toUpperCase().endsWith('USDT') 
      ? coinName.replace('USDT', '') 
      : coinName.toUpperCase();
    
    if (!this.coinsData.has(normalizedCoinName)) {
      throw new Error(`Coin data not available for ${normalizedCoinName}`);
    }
    
    const coin: BinanceCoinModel = this.coinsData.get(normalizedCoinName)!;

    const rsi = await this.calculateRSI(coin.symbol);

    let prediction = '-';
    
    if (rsi <= 30) {
      prediction = 'Up';
    } else if (rsi >= 70) {
      prediction = 'Down';
    } else {
      prediction = '-';
    }
    
    return {
      symbol: normalizedCoinName,
      baseAsset: coinName.replace('USDT', ''),
      rsi,
      prediction
    };
  }

  async getAllCoins(): Promise<Array<CoinDto>> {

    if (this.coinsData.size === 0) {
      await this.getTopCoins();
    }
    
    return Array.from(this.coinsData.values()).map(coin => ({
      symbol: coin.symbol,
      baseAsset: coin.baseAsset,
      lastPrice: coin.lastPrice,
      volume: coin.volume,
      quoteVolume: coin.quoteVolume
    }));
  }
}