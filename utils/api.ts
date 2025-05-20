import axios from 'axios';

// Śledzone symbole kryptowalut
const CRYPTO_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'DOTUSDT',
  'MATICUSDT',
  'LINKUSDT',
];

// Statyczne przeliczniki walut
const CURRENCY_RATES = {
  USD: 1,
  EUR: 0.91,
  PLN: 3.94,
};

// Metadane kryptowalut
const CRYPTO_METADATA = {
  'BTCUSDT': { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  'ETHUSDT': { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  'BNBUSDT': { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB' },
  'XRPUSDT': { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  'ADAUSDT': { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  'DOGEUSDT': { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  'SOLUSDT': { id: 'solana', name: 'Solana', symbol: 'SOL' },
  'DOTUSDT': { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  'MATICUSDT': { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
  'LINKUSDT': { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
};

// Pobiera aktualne dane z Binance (cena + zmiana 24h)
export const getCryptoData = async (currency = 'USD') => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const binanceData = response.data;

    const filteredData = binanceData.filter((item: any) => CRYPTO_SYMBOLS.includes(item.symbol));

    const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;

    return filteredData.map((item: { symbol: keyof typeof CRYPTO_METADATA; lastPrice: string; priceChangePercent: string; }) => {
      const metadata = CRYPTO_METADATA[item.symbol];
      return {
        id: metadata.id,
        symbol: metadata.symbol,
        name: metadata.name,
        price: parseFloat(item.lastPrice) * rate,
        priceChangePercent: parseFloat(item.priceChangePercent),
      };
    });
  } catch (error) {
    console.error('Error fetching real crypto data from Binance API:', error);
    return [];
  }
};

// Pobiera historyczne dane świecowe z Binance
export const getHistoricalData = async (cryptoId: string, timeframe = '1d', currency = 'USD') => {
  try {
    const symbolEntry = Object.entries(CRYPTO_METADATA).find(([_, meta]) => meta.id === cryptoId);
    if (!symbolEntry) throw new Error(`Symbol not found for cryptoId: ${cryptoId}`);
    
    const [symbol] = symbolEntry;

    const intervalMap: Record<string, string> = {
      '1d': '1h',
      '1w': '4h',
      '1m': '1d',
      '1y': '1w',
    };
    const interval = intervalMap[timeframe] || '1h';

    const limitMap: Record<string, number> = {
      '1d': 24,
      '1w': 42,
      '1m': 30,
      '1y': 52,
    };
    const limit = limitMap[timeframe] || 24;

    const response = await axios.get('https://api.binance.com/api/v3/klines', {
      params: {
        symbol,
        interval,
        limit,
      },
    });

    const rawData = response.data;
    const rate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;

    return rawData.map((item: any[]) => ({
      timestamp: item[0], // open time
      price: parseFloat(item[4]) * rate, // close price
    }));
  } catch (error) {
    console.error('Error fetching historical data from Binance API:', error);
    return [];
  }
};
