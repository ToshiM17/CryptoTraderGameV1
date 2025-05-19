import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryArea } from 'victory-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';

type TimeFrame = '1D' | '1W' | '1M' | '1Y';

type PriceChartProps = {
  cryptoId: string;
  data: any[];
  currency: string;
};

export function PriceChart({ cryptoId, data, currency }: PriceChartProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  
  const screenWidth = Dimensions.get('window').width - 32; // Adjust for padding
  
  // Filter data based on selected timeframe
  const filteredData = data.filter(item => {
    const date = new Date(item.timestamp);
    const now = new Date();
    
    switch (timeFrame) {
      case '1D':
        return date >= new Date(now.setDate(now.getDate() - 1));
      case '1W':
        return date >= new Date(now.setDate(now.getDate() - 7));
      case '1M':
        return date >= new Date(now.setMonth(now.getMonth() - 1));
      case '1Y':
        return date >= new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return true;
    }
  });
  
  // Calculate price change
  const startPrice = filteredData[0]?.price || 0;
  const endPrice = filteredData[filteredData.length - 1]?.price || 0;
  const priceChange = endPrice - startPrice;
  const priceChangePercent = startPrice ? (priceChange / startPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  
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
  
  const chartColor = isPositive ? Colors.success : Colors.error;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.error }]}>
          {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
        </Text>
        
        <View style={styles.timeFrames}>
          {(['1D', '1W', '1M', '1Y'] as TimeFrame[]).map((option) => (
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
      
      <View style={styles.chartContainer}>
        <VictoryChart
          width={screenWidth}
          height={200}
          padding={{ top: 10, bottom: 30, left: 40, right: 20 }}
        >
          <VictoryArea
            data={filteredData}
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
            tickFormat={(timestamp) => formatXAxis(timestamp)}
          />
        </VictoryChart>
      </View>
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