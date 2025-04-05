# Crypto Prediction Bot

A NestJS application that analyzes RSI values for the top 100 cryptocurrencies from Binance and provides trading signals.

## Features

- Fetches top 100 coins from Binance by trading volume
- Calculates RSI (Relative Strength Index) for each cryptocurrency
- Provides trading signals (Up/Down) based on RSI values
- RESTful API with Swagger documentation

## Requirements

- Node.js (v14 or later)
- npm or yarn
- Internet connection to access Binance API

## Installation

1. Clone the repository:

```bash
git clone https://github.com/arsescode/binance-crypto-prediction.git
cd crypto-prediction-bot
```

2. Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the project root (optional):

```
PORT=3000
BINANCE_API_URL=https://api1.binance.com
UPDATE_INTERVAL=300000
```

## Running the Application

Start the development server:

```bash
npm run start:dev
```

For production:

```bash
npm run build
npm run start:prod
```

## API Documentation (Swagger)

The API documentation is available through Swagger UI.

1. Ensure the application is running
2. Open your browser and navigate to:
   ```
   http://localhost:3000/api
   ```

## API Endpoints

- `GET /crypto/coins` - Get all monitored coins
- `GET /crypto/prediction/:symbol` - Get prediction for a specific coin (e.g., BTC, ETH)

## Response Format

All API responses follow this format:

```json
{
  "status": "success|failed|notFound|...",
  "message": "Operation successful",
  "data": { ... }
}
```

## License

MIT