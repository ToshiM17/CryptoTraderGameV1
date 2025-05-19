import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Currency = 'USD' | 'EUR' | 'PLN';
type Transaction = {
  id: string;
  cryptoId: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  timestamp: number;
  taxPaid?: number;
};

type Portfolio = {
  [cryptoId: string]: {
    amount: number;
    averageBuyPrice: number;
  };
};

interface AppContextType {
  virtualMoney: number;
  setVirtualMoney: (amount: number) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  portfolio: Portfolio;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  resetPortfolio: () => void;
}

const DEFAULT_VIRTUAL_MONEY = 10000;
const TAX_RATE = 0.02; // 2% tax on sales

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [virtualMoney, setVirtualMoney] = useState(DEFAULT_VIRTUAL_MONEY);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedMoney = await AsyncStorage.getItem('virtualMoney');
        const storedCurrency = await AsyncStorage.getItem('currency');
        const storedPortfolio = await AsyncStorage.getItem('portfolio');
        const storedTransactions = await AsyncStorage.getItem('transactions');

        if (storedMoney) setVirtualMoney(parseFloat(storedMoney));
        if (storedCurrency) setCurrency(storedCurrency as Currency);
        if (storedPortfolio) setPortfolio(JSON.parse(storedPortfolio));
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('virtualMoney', virtualMoney.toString());
        await AsyncStorage.setItem('currency', currency);
        await AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
        await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [virtualMoney, currency, portfolio, transactions]);

  // Function to add a transaction and update portfolio
  const addTransaction = (newTransaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const transaction = {
      ...newTransaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    // Calculate total cost/revenue
    const totalValue = transaction.amount * transaction.price;

    if (transaction.type === 'buy') {
      // Check if user has enough money
      if (virtualMoney < totalValue) {
        throw new Error('Not enough virtual money');
      }

      // Update virtual money (decrease)
      setVirtualMoney(prev => prev - totalValue);

      // Update portfolio
      setPortfolio(prev => {
        const currentCrypto = prev[transaction.cryptoId] || { amount: 0, averageBuyPrice: 0 };
        const totalInvestment = (currentCrypto.amount * currentCrypto.averageBuyPrice) + totalValue;
        const newAmount = currentCrypto.amount + transaction.amount;
        
        return {
          ...prev,
          [transaction.cryptoId]: {
            amount: newAmount,
            averageBuyPrice: totalInvestment / newAmount,
          }
        };
      });
    } else if (transaction.type === 'sell') {
      // Check if user has enough crypto
      const currentCrypto = portfolio[transaction.cryptoId];
      if (!currentCrypto || currentCrypto.amount < transaction.amount) {
        throw new Error('Not enough cryptocurrency');
      }

      // Calculate tax (2%)
      const tax = totalValue * TAX_RATE;
      const netProceeds = totalValue - tax;

      // Update transaction with tax paid
      transaction.taxPaid = tax;

      // Update virtual money (increase by net amount after tax)
      setVirtualMoney(prev => prev + netProceeds);

      // Update portfolio
      setPortfolio(prev => {
        const updatedAmount = prev[transaction.cryptoId].amount - transaction.amount;
        
        if (updatedAmount <= 0) {
          const { [transaction.cryptoId]: _, ...rest } = prev;
          return rest;
        }
        
        return {
          ...prev,
          [transaction.cryptoId]: {
            ...prev[transaction.cryptoId],
            amount: updatedAmount,
          }
        };
      });
    }

    // Add transaction to history
    setTransactions(prev => [...prev, transaction]);
  };

  // Function to reset portfolio and virtual money
  const resetPortfolio = () => {
    setVirtualMoney(DEFAULT_VIRTUAL_MONEY);
    setPortfolio({});
    setTransactions([]);
  };

  return (
    <AppContext.Provider
      value={{
        virtualMoney,
        setVirtualMoney,
        currency,
        setCurrency,
        portfolio,
        transactions,
        addTransaction,
        resetPortfolio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};