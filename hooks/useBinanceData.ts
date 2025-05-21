import { useEffect, useState } from 'react';

export const useBinanceData = (symbol: string, interval: string, limit: number) => {
  const [data, setData] = useState<{ timestamp: number; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        );
        const json = await res.json();

        const formatted = json.map((item: any[]) => ({
          timestamp: item[0], // open time
          price: parseFloat(item[4]), // close price
        }));

        setData(formatted);
      } catch (error) {
        console.error('Binance fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [symbol, interval, limit]);

  return { data, loading };
};
