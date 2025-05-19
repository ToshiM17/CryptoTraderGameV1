import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency, formatPercentage, formatCrypto } from '@/utils/formatters';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type CryptoListItemProps = {
  crypto: any;
  currency: string;
  onPress: () => void;
};

export function CryptoListItem({ crypto, currency, onPress }: CryptoListItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const isPositive = crypto.priceChangePercent >= 0;
  const changeColor = isPositive ? Colors.success : Colors.error;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        <Text style={[styles.symbol, { color: colors.text }]}>{crypto.symbol}</Text>
        <Text style={[styles.name, { color: colors.textSecondary }]}>{crypto.name}</Text>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={[styles.price, { color: colors.text }]}>
          {formatCurrency(crypto.price, currency)}
        </Text>
        
        <View style={[
          styles.changeContainer,
          { backgroundColor: isPositive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 59, 48, 0.1)' }
        ]}>
          <Text style={[styles.change, { color: changeColor }]}>
            {formatPercentage(crypto.priceChangePercent)}
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
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  changeContainer: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  change: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});