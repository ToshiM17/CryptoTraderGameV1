import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { formatCurrency, formatCrypto, formatDate } from '@/utils/formatters';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

type TransactionListProps = {
  transactions: any[];
  cryptoData: any[];
  currency: string;
  refreshing: boolean;
  onRefresh: () => void;
};

export function TransactionList({ 
  transactions, 
  cryptoData, 
  currency, 
  refreshing, 
  onRefresh 
}: TransactionListProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  const renderTransaction = ({ item }: { item: any }) => {
    const crypto = cryptoData.find(c => c.id === item.cryptoId);
    const isBuy = item.type === 'buy';
    const totalValue = item.amount * item.price;
    
    return (
      <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
        <View style={styles.transactionHeader}>
          <View style={styles.typeContainer}>
            <View style={[
              styles.typeIconContainer,
              { backgroundColor: isBuy ? `${Colors.success}20` : `${Colors.error}20` }
            ]}>
              {isBuy ? (
                <TrendingUp size={16} color={Colors.success} />
              ) : (
                <TrendingDown size={16} color={Colors.error} />
              )}
            </View>
            <Text style={[styles.typeText, { color: colors.text }]}>
              {isBuy ? t('bought') : t('sold')}
            </Text>
          </View>
          
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={[styles.cryptoAmount, { color: colors.text }]}>
            {isBuy ? '+' : '-'} {formatCrypto(item.amount)} {crypto?.symbol || item.cryptoId}
          </Text>
          
          <Text style={[styles.price, { color: colors.textSecondary }]}>
            @ {formatCurrency(item.price, currency)}
          </Text>
        </View>
        
        <View style={styles.transactionFooter}>
          <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
            {t('total_value')}:
          </Text>
          <Text style={[
            styles.valueText,
            { color: isBuy ? Colors.error : Colors.success }
          ]}>
            {isBuy ? '-' : '+'} {formatCurrency(
              isBuy ? totalValue : (totalValue - (item.taxPaid || 0)),
              currency
            )}
          </Text>
        </View>
        
        {!isBuy && item.taxPaid && (
          <View style={styles.taxInfo}>
            <Text style={[styles.taxLabel, { color: colors.textSecondary }]}>
              {t('tax_paid')} (2%):
            </Text>
            <Text style={[styles.taxValue, { color: Colors.error }]}>
              - {formatCurrency(item.taxPaid, currency)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={sortedTransactions}
      keyExtractor={(item) => item.id}
      renderItem={renderTransaction}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('no_transactions')}
          </Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  transactionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  cryptoAmount: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  valueText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  taxInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  taxLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  taxValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});