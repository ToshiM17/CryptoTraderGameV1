import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '@/utils/formatters';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { Wallet } from 'lucide-react-native';

type PortfolioSummaryProps = {
  virtualMoney: number;
  portfolioValue: number;
  currency: string;
};

export function PortfolioSummary({ virtualMoney, portfolioValue, currency }: PortfolioSummaryProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const totalValue = virtualMoney + portfolioValue;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: colors.tintLight }]}>
          <Wallet size={24} color={colors.tint} />
        </View>
      </View>
      
      <View style={styles.summaryContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('total_value')}
        </Text>
        
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {formatCurrency(totalValue, currency)}
        </Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('cash')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatCurrency(virtualMoney, currency)}
            </Text>
          </View>
          
          <View style={styles.detailSeparator} />
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {t('crypto')}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatCurrency(portfolioValue, currency)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContent: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  detailSeparator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginHorizontal: 12,
  },
});