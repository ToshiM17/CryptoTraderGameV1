import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type CryptoCardProps = {
  crypto: any;
  currency: string;
  icon?: React.ReactNode;
};

export function CryptoCard({ crypto, currency, icon }: CryptoCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const isPositive = crypto.priceChangePercent >= 0;
  const changeColor = isPositive ? Colors.success : Colors.error;
  
  const handlePress = () => {
    router.push({
      pathname: 'modals/buy',
      params: {
        cryptoId: crypto.id,
        cryptoName: crypto.name,
        cryptoPrice: crypto.price.toString()
      }
    });
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={handlePress}
    >
      <View style={styles.topRow}>
        <View style={styles.nameContainer}>
          <Text style={[styles.symbol, { color: colors.text }]}>{crypto.symbol}</Text>
          <Text style={[styles.name, { color: colors.textSecondary }]}>{crypto.name}</Text>
        </View>
        
        {icon}
      </View>
      
      <View style={styles.bottomRow}>
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
    borderRadius: 16,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: 'column',
  },
  symbol: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  changeContainer: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  change: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});