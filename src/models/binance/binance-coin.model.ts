export interface BinanceSymbolMiniModel {
    symbol: string
    openPrice: string
    highPrice: string
    lowPrice: string
    lastPrice: string
    volume: string
    quoteVolume: string
    openTime: number
    closeTime: number
    firstId: number
    lastId: number
    count: number
  }
export interface BinanceCoinModel extends BinanceSymbolMiniModel {
    baseAsset: string
}
