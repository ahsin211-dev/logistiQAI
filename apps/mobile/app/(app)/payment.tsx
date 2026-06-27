import { useEffect, useState } from 'react';
import { View, Text, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { Button } from '../../src/components/Button';
import { LoadingState } from '../../src/components/LoadingState';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    api.get<Array<Record<string, unknown>>>('/payments/history').then(setHistory).catch(() => {});
  }, []);

  const handleCheckout = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.post<{ checkoutUrl?: string; amount: number; message?: string }>(
        '/payments/checkout',
        { shipmentId: id },
      );
      if (res.checkoutUrl) {
        await Linking.openURL(res.checkoutUrl);
      } else {
        Alert.alert('Payment', res.message || `Payment of $${res.amount.toFixed(2)} recorded`);
      }
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Button title="← Back" onPress={() => router.back()} variant="outline" style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
      <Text className="text-2xl font-bold mb-6">Payment & Invoice</Text>

      <View className="bg-gray-50 rounded-2xl p-4 mb-6">
        <Text className="text-gray-500 text-sm">Secure payment via Stripe</Text>
        <Text className="text-gray-700 mt-2">All payment actions are logged and auditable.</Text>
      </View>

      <Button title="Pay Now" onPress={handleCheckout} loading={loading} />

      <Text className="text-lg font-semibold mt-8 mb-3">Payment History</Text>
      {history.length === 0 ? (
        <Text className="text-gray-400">No payment history</Text>
      ) : (
        history.map((p, i) => (
          <View key={i} className="border-b border-gray-100 py-3">
            <Text className="text-gray-600">{JSON.stringify(p)}</Text>
          </View>
        ))
      )}
    </SafeAreaView>
  );
}
