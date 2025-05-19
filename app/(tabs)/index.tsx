import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency } from '@/utils/formatters';
import { getCryptoData } from '@/utils/api';
import { CryptoCard } from '@/components/CryptoCard';
import { PortfolioSummary } from '@/components/PortfolioSummary';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react-native';

export default function DashboardScreen() {
  const { virtualMoney, currency, portfolio } = useAppContext();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Get trending cryptocurrencies (top gainers and losers)
  const sortedByChange = [...cryptoData].sort((a, b) => b.priceChangePercent - a.priceChangePercent);
  const topGainers = sortedByChange.slice(0, 3);
  const topLosers = sortedByChange.slice(-3).reverse();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('dashboard')}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <RefreshCw size={20} color={colors.tint} />
          </TouchableOpacity>
        </View>
        
        <PortfolioSummary
          virtualMoney={virtualMoney}
          portfolioValue={portfolioValue}
          currency={currency}
        />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('top_gainers')}
          </Text>
          <View style={styles.cryptoList}>
            {topGainers.map(crypto => (
              <CryptoCard
                key={crypto.id}
                crypto={crypto}
                currency={currency}
                icon={<TrendingUp size={18} color={Colors.success} />}
              />
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('top_losers')}
          </Text>
          <View style={styles.cryptoList}>
            {topLosers.map(crypto => (
              <CryptoCard
                key={crypto.id}
                crypto={crypto}
                currency={currency}
                icon={<TrendingDown size={18} color={Colors.error} />}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  refreshButton: {
    padding: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  cryptoList: {
    gap: 12,
  },
});