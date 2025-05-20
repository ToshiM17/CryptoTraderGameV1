import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatCrypto, formatPercentage } from '@/utils/formatters';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

type PortfolioItemProps = {
  item: any;
  currency: string;
  onPress: () => void;
};

const CURRENCY_RATES: { [key: string]: number } = {
  USD: 1,
  EUR: 0.91,
  PLN: 3.94,
};

export function PortfolioItem({ item, currency, onPress }: PortfolioItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const isProfit = item.profitLoss >= 0;
  const changeColor = isProfit ? Colors.success : Colors.error;
  const ChangeIcon = isProfit ? TrendingUp : TrendingDown;

  // Przelicz zysk/stratę (liczoną w USD) na wybraną walutę do wyświetlenia
  const profitLossInSelectedCurrency =
    item.profitLoss / CURRENCY_RATES['USD'] * (CURRENCY_RATES[currency] || 1);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.amount, { color: colors.textSecondary }]}>
            {formatCrypto(item.amount)}
          </Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>
            ≈ {formatCurrency(item.value, currency)}
          </Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <Text style={[styles.profitLoss, { color: changeColor }]}>
          {isProfit ? '+' : ''}{formatCurrency(profitLossInSelectedCurrency, currency)}
        </Text>

        <View style={styles.percentRow}>
          <ChangeIcon size={12} color={changeColor} />
          <Text style={[styles.percentChange, { color: changeColor }]}>
            {formatPercentage(item.profitLossPercent)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  symbol: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  profitLoss: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentChange: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});
