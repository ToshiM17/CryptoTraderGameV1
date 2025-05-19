import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCryptoData } from '@/utils/api';
import { PortfolioItem } from '@/components/PortfolioItem';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import { TransactionList } from '@/components/TransactionList';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { formatCurrency } from '@/utils/formatters';

export default function PortfolioScreen() {
  const { virtualMoney, currency, portfolio, transactions } = useAppContext();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'holdings' | 'transactions'>('holdings');

  const loadCryptoData = async () => {
    try {
      setLoading(true);
      const data = await getCryptoData(currency);
      setCryptoData(data);
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCryptoData();
    
    // Refresh data every 60 seconds
    const intervalId = setInterval(loadCryptoData, 60000);
    return () => clearInterval(intervalId);
  }, [currency]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCryptoData();
    setRefreshing(false);
  };

  // Calculate portfolio value
  const portfolioValue = Object.entries(portfolio).reduce((total, [cryptoId, data]) => {
    const crypto = cryptoData.find(c => c.id === cryptoId);
    return total + (crypto ? data.amount * crypto.price : 0);
  }, 0);

  // Prepare portfolio items for display
  const portfolioItems = Object.entries(portfolio).map(([cryptoId, data]) => {
    const crypto = cryptoData.find(c => c.id === cryptoId);
    if (!crypto) return null;
    
    const value = data.amount * crypto.price;
    const profitLoss = value - (data.amount * data.averageBuyPrice);
    const profitLossPercent = ((crypto.price / data.averageBuyPrice) - 1) * 100;
    
    return {
      id: cryptoId,
      name: crypto.name,
      symbol: crypto.symbol,
      amount: data.amount,
      value,
      profitLoss,
      profitLossPercent,
      price: crypto.price,
      crypto,
    };
  }).filter(Boolean);

  const handleSell = (item: any) => {
    router.push({
      pathname: 'modals/sell',
      params: {
        cryptoId: item.id,
        cryptoName: item.name,
        cryptoPrice: item.price,
        cryptoAmount: item.amount,
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('portfolio')}</Text>
      </View>
      
      <PortfolioSummary
        virtualMoney={virtualMoney}
        portfolioValue={portfolioValue}
        currency={currency}
      />
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            view === 'holdings' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
          ]}
          onPress={() => setView('holdings')}
        >
          <Text style={[
            styles.tabText,
            { color: view === 'holdings' ? colors.tint : colors.textSecondary }
          ]}>
            {t('holdings')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            view === 'transactions' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
          ]}
          onPress={() => setView('transactions')}
        >
          <Text style={[
            styles.tabText,
            { color: view === 'transactions' ? colors.tint : colors.textSecondary }
          ]}>
            {t('transactions')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {view === 'holdings' ? (
        <FlatList
          data={portfolioItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PortfolioItem
              item={item}
              currency={currency}
              onPress={() => handleSell(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('no_holdings')}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <TransactionList
          transactions={transactions}
          cryptoData={cryptoData}
          currency={currency}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  tabs: {
    flexDirection: 'row',
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
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
});