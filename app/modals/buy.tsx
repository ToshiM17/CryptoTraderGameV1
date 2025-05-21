import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/hooks/useTranslation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { X } from 'lucide-react-native';
import { formatCurrency, formatCrypto } from '@/utils/formatters';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { PriceChart } from '@/components/PriceChart';
import { CRYPTO_METADATA } from '@/utils/api';

export default function BuyModal() {
  const params = useLocalSearchParams<{
    cryptoId: string;
    cryptoName: string;
    cryptoPrice: string;
  }>();
  const { virtualMoney, currency, addTransaction } = useAppContext();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [amount, setAmount] = useState('');
  const [value, setValue] = useState(0);
  
  const cryptoId = params.cryptoId;
  const cryptoName = params.cryptoName;
  const cryptoPrice = parseFloat(params.cryptoPrice || '0');

  const getBinanceSymbolFromIdOrName = (id: string, name: string): string => {
  const entry = Object.entries(CRYPTO_METADATA).find(
    ([, meta]) =>
      meta.id.toLowerCase() === id.toLowerCase() ||
      meta.name.toLowerCase() === name.toLowerCase()
  );
  return entry ? entry[0] : 'BTCUSDT'; // domyślnie BTCUSDT jeśli nie znaleziono
};
  
  const handleAmountChange = (text: string) => {
    // Accept only numbers and decimals
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      setAmount(text);
      const numAmount = parseFloat(text) || 0;
      setValue(numAmount * cryptoPrice);
    }
  };
  
  const handleValueChange = (text: string) => {
    // Accept only numbers and decimals
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      const numValue = parseFloat(text) || 0;
      setValue(numValue);
      setAmount((numValue / cryptoPrice).toString());
    }
  };
  
  const handleMaxPress = () => {
    if (cryptoPrice > 0) {
      const maxAmount = Math.floor((virtualMoney / cryptoPrice) * 10000) / 10000;
      setAmount(maxAmount.toString());
      setValue(maxAmount * cryptoPrice);
    }
  };
  
  const handleBuy = () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      Alert.alert(t('error'), t('enter_valid_amount'));
      return;
    }
    
    if (value > virtualMoney) {
      Alert.alert(t('error'), t('not_enough_money'));
      return;
    }
    
    try {
      addTransaction({
        cryptoId,
        amount: numAmount,
        price: cryptoPrice,
        type: 'buy',
      });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        t('success'),
        t('buy_success', { amount: numAmount, crypto: cryptoName }),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('error'), (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('buy')} {cryptoName}
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView>
      
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('available')}:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {formatCurrency(virtualMoney, currency)}
          </Text>
        </View>
        
        <View style={styles.info}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            {t('price')}:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {formatCurrency(cryptoPrice, currency)}
          </Text>
        </View>
        
        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {t('amount')}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              style={[styles.maxButton, { backgroundColor: colors.tintLight }]}
              onPress={handleMaxPress}
            >
              <Text style={[styles.maxText, { color: colors.tint }]}>
                {t('max')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {t('value')}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={value.toString()}
              onChangeText={handleValueChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.currencyIndicator, { color: colors.textSecondary }]}>
              {currency}
            </Text>
          </View>
        </View>
        <View style={styles.summary}>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {t('buy_summary', {
              amount: formatCrypto(parseFloat(amount) || 0),
              crypto: cryptoName,
              value: formatCurrency(value, currency)
            })}
          </Text>
        </View>
      </View>
      <View>
        <PriceChart symbol={getBinanceSymbolFromIdOrName(cryptoId, cryptoName)} />
      </View>
      
      </ScrollView>
      <TouchableOpacity
        style={[
          styles.buyButton,
          { backgroundColor: Colors.success },
          (!amount || parseFloat(amount) <= 0 || value > virtualMoney) && { opacity: 0.5 }
        ]}
        onPress={handleBuy}
        disabled={!amount || parseFloat(amount) <= 0 || value > virtualMoney}
      >
        <Text style={styles.buyButtonText}>
          {t('buy_now')}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  inputGroup: {
    marginBottom: 24,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Inter-Medium',
    padding: 0,
  },
  maxButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  maxText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  currencyIndicator: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  summary: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  summaryText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  buyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buyButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
});