import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis } from 'victory-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { format } from 'date-fns';
import { ScrollView } from 'react-native-gesture-handler';

type TimeFrame = '1D' | '1W' | '1M' | '1Y';

type BinanceKline = [
  number, string, string, string, string, string, string, number, string, string, string, string
];

type PriceChartProps = {
  symbol: string; // e.g. BTCUSDT
};

const TIME_FRAME_CONFIG: Record<TimeFrame, { interval: string; limit: number }> = {
  '1D': { interval: '1h', limit: 24 },
  '1W': { interval: '4h', limit: 42 },
  '1M': { interval: '1d', limit: 30 },
  '1Y': { interval: '1w', limit: 52 },
};

export function PriceChart({ symbol }: PriceChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [data, setData] = useState<{ timestamp: number; price: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const screenWidth = Dimensions.get('window').width - 32;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { interval, limit } = TIME_FRAME_CONFIG[timeFrame];
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        );
        const json: BinanceKline[] = await response.json();

        const formatted = json.map(item => ({
          timestamp: item[0],
          price: parseFloat(item[4]), // close price
        }));

        setData(formatted);
      } catch (error) {
        console.error('Error fetching Binance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, timeFrame]);

  const startPrice = data[0]?.price || 0;
  const endPrice = data[data.length - 1]?.price || 0;
  const priceChange = endPrice - startPrice;
  const priceChangePercent = startPrice ? (priceChange / startPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  const chartColor = isPositive ? Colors.success : Colors.error;
  const minPrice = data.length > 0 ? Math.min(...data.map(d => d.price)) : 0;

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    switch (timeFrame) {
      case '1D':
        return format(date, 'HH:mm');
      case '1W':
        return format(date, 'EEE');
      case '1M':
        return format(date, 'd MMM');
      case '1Y':
        return format(date, 'MMM');
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.error }]}>
          {isPositive ? '+' : ''}
          {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
        </Text>
        <View style={styles.timeFrames}>
          {(['1D', '1W', '1M', '1Y'] as TimeFrame[]).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.timeFrameButton,
                timeFrame === option && { backgroundColor: colors.tintLight }
              ]}
              onPress={() => setTimeFrame(option)}
            >
              <Text
                style={[
                  styles.timeFrameText,
                  { color: timeFrame === option ? colors.tint : colors.textSecondary }
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <View style={styles.chartContainer}>
          <VictoryChart
            width={screenWidth}
            height={200}
            padding={{ top: 10, bottom: 30, left: 50, right: 20 }}
            domain={{ y: [minPrice, data.length > 0 ? Math.max(...data.map(d => d.price)) : minPrice] }}
          >
            <VictoryArea
              data={data}
              x="timestamp"
              y="price"
              style={{
                data: {
                  fill: `${chartColor}20`,
                  stroke: chartColor,
                  strokeWidth: 2,
                },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: colors.border },
                grid: { stroke: `${colors.border}50` },
                tickLabels: { fill: colors.textSecondary, fontSize: 10 },
              }}
            />
            <VictoryAxis
              style={{
                axis: { stroke: colors.border },
                grid: { stroke: 'transparent' },
                tickLabels: { fill: colors.textSecondary, fontSize: 10 },
              }}
              tickFormat={formatXAxis}
            />
          </VictoryChart>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  timeFrames: {
    flexDirection: 'row',
  },
  timeFrameButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  timeFrameText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  chartContainer: {
    alignItems: 'center',
  },
});
