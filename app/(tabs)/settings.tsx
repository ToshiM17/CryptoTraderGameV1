import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { useAppContext } from '@/contexts/AppContext';
import { useI18nContext } from '@/contexts/I18nContext';
import { useTranslation } from '@/hooks/useTranslation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  DollarSign,
  Euro,
  Wallet,
  Languages,
  RotateCcw,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { virtualMoney, currency, setCurrency, setVirtualMoney, resetPortfolio } = useAppContext();
  const { language, changeLanguage } = useI18nContext();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.91,
    PLN: 3.94,
  };

  const currencies = [
    { code: 'USD', label: 'US Dollar ($)', icon: <DollarSign size={20} color={colors.text} /> },
    { code: 'EUR', label: 'Euro (€)', icon: <Euro size={20} color={colors.text} /> },
    { code: 'PLN', label: 'Polish Złoty (zł)', icon: <DollarSign size={20} color={colors.text} /> },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'pl', label: 'Polski' },
    { code: 'es', label: 'Español' },
  ];

  const confirmReset = () => {
    Alert.alert(
      t('confirm_reset'),
      t('reset_warning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: resetPortfolio
        }
      ]
    );
  };

  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currency) return;

    const oldRate = exchangeRates[currency];
    const newRate = exchangeRates[newCurrency];

    const usdValue = virtualMoney / oldRate;
    const newValue = usdValue * newRate;

    setVirtualMoney(newValue);
    setCurrency(newCurrency as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('currency')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {currencies.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.option,
                currency === item.code && { backgroundColor: colors.tintLight }
              ]}
              onPress={() => handleCurrencyChange(item.code)}
            >
              <View style={styles.optionLeft}>
                {item.icon}
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              {currency === item.code && (
                <View style={[styles.checkmark, { backgroundColor: colors.tint }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('language')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {languages.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.option,
                language === item.code && { backgroundColor: colors.tintLight }
              ]}
              onPress={() => changeLanguage(item.code as any)}
            >
              <View style={styles.optionLeft}>
                <Languages size={20} color={colors.text} />
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              {language === item.code && (
                <View style={[styles.checkmark, { backgroundColor: colors.tint }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('actions')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.option}
            onPress={confirmReset}
          >
            <View style={styles.optionLeft}>
              <RotateCcw size={20} color={Colors.error} />
              <Text style={[styles.optionText, { color: Colors.error }]}>
                {t('reset_portfolio')}
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {t('trading_simulator')}
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          Version 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  version: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});
