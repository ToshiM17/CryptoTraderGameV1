import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCryptoData } from '@/utils/api';
import { CryptoListItem } from '@/components/CryptoListItem';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

export default function MarketScreen() {
  const { currency } = useAppContext();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadCryptoData = async () => {
    try {
      setLoading(true);
      const data = await getCryptoData(currency);
      setCryptoData(data);
      setFilteredData(data);
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

  useEffect(() => {
    // Filter and sort data whenever search query or sort options change
    let result = [...cryptoData];
    
    if (searchQuery.trim()) {
      result = result.filter(
        item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort data
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'change') {
        comparison = a.priceChangePercent - b.priceChangePercent;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredData(result);
  }, [cryptoData, searchQuery, sortBy, sortOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCryptoData();
    setRefreshing(false);
  };

  const toggleSort = (field: 'name' | 'price' | 'change') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleBuy = (crypto: any) => {
    router.push({
      pathname: '/modals/buy',
      params: { cryptoId: crypto.id, cryptoName: crypto.name, cryptoPrice: crypto.price }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('market')}</Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('search_crypto')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => toggleSort('name')}
        >
          <Text style={[
            styles.sortText,
            { color: sortBy === 'name' ? colors.tint : colors.textSecondary }
          ]}>
            {t('name')} {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => toggleSort('price')}
        >
          <Text style={[
            styles.sortText,
            { color: sortBy === 'price' ? colors.tint : colors.textSecondary }
          ]}>
            {t('price')} {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => toggleSort('change')}
        >
          <Text style={[
            styles.sortText,
            { color: sortBy === 'change' ? colors.tint : colors.textSecondary }
          ]}>
            {t('24h')} {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CryptoListItem
            crypto={item}
            currency={currency}
            onPress={() => handleBuy(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  sortContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sortButton: {
    marginRight: 24,
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  listContent: {
    paddingBottom: 16,
  },
});