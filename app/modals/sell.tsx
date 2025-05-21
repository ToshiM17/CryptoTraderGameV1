import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
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
import { ScrollView } from 'react-native-gesture-handler';

export default function SellModal() {
  const params = useLocalSearchParams<{
    cryptoId: string;
    cryptoName: string;
    cryptoPrice: string;
    cryptoAmount: string;
  }>();

  const getBinanceSymbolFromIdOrName = (id: string, name: string): string => {
    const entry = Object.entries(CRYPTO_METADATA).find(
      ([, meta]) =>
        meta.id.toLowerCase() === id.toLowerCase() ||
        meta.name.toLowerCase() === name.toLowerCase()
    );
    return entry ? entry[0] : 'BTCUSDT'; // domyślnie BTCUSDT jeśli nie znaleziono
  };
  
  const { currency, addTransaction } = useAppContext();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [amount, setAmount] = useState('');
  const [value, setValue] = useState(0);
  
  const cryptoId = params.cryptoId;
  const cryptoName = params.cryptoName;
  const cryptoPrice = parseFloat(params.cryptoPrice || '0');
  const maxAmount = parseFloat(params.cryptoAmount || '0');
  
  // Calculate tax rate
  const TAX_RATE = 0.02; // 2%
  
  const handleAmountChange = (text: string) => {
    // Accept only numbers and decimals
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      setAmount(text);
      const numAmount = parseFloat(text) || 0;
      const grossValue = numAmount * cryptoPrice;
      setValue(grossValue);
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
    if (cryptoPrice > 0 && maxAmount > 0) {
      setAmount(maxAmount.toString());
      setValue(maxAmount * cryptoPrice);
    }
  };
  
  const calculateTax = (grossValue: number) => {
    return grossValue * TAX_RATE;
  };
  
  const calculateNetValue = (grossValue: number) => {
    return grossValue - calculateTax(grossValue);
  };
  
  const handleSell = () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      Alert.alert(t('error'), t('enter_valid_amount'));
      return;
    }
    
    if (numAmount > maxAmount) {
      Alert.alert(t('error'), t('not_enough_crypto'));
      return;
    }
    
    try {
      addTransaction({
        cryptoId,
        amount: numAmount,
        price: cryptoPrice,
        type: 'sell',
      });
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        t('success'),
        t('sell_success', { amount: numAmount, crypto: cryptoName }),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t('error'), (error as Error).message);
    }
  };

  const grossValueAmount = value;
  const taxAmount = calculateTax(grossValueAmount);
  const netValueAmount = calculateNetValue(grossValueAmount);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('sell')} {cryptoName}
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
            {formatCrypto(maxAmount)} {cryptoName}
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
        
        <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('gross_value')}:
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatCurrency(grossValueAmount, currency)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {t('tax')} (2%):
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.error }]}>
              - {formatCurrency(taxAmount, currency)}
            </Text>
          </View>
          
          <View style={[styles.summaryRow, styles.netValueRow]}>
            <Text style={[styles.netValueLabel, { color: colors.text }]}>
              {t('net_value')}:
            </Text>
            <Text style={[styles.netValueAmount, { color: colors.text }]}>
              {formatCurrency(netValueAmount, currency)}
            </Text>
          </View>
        </View>
      </View>
      <View>
        <PriceChart symbol={getBinanceSymbolFromIdOrName(cryptoId, cryptoName)} />
      </View>
      </ScrollView>
      <TouchableOpacity
        style={[
          styles.sellButton,
          { backgroundColor: Colors.error },
          (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount) && { opacity: 0.5 }
        ]}
        onPress={handleSell}
        disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
      >
        <Text style={styles.sellButtonText}>
          {t('sell_now')}
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
  summaryContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  netValueRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  netValueLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  netValueAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  sellButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  sellButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
});