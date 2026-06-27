import { useEffect } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShipmentStore } from '../../src/stores/shipmentStore';
import { ShipmentCard } from '../../src/components/ShipmentCard';
import { LoadingState, ErrorState } from '../../src/components/LoadingState';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/stores/authStore';
import { UserRole } from '@logistics/shared';

export default function ShipmentsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { shipments, fetchShipments, isLoading, error } = useShipmentStore();

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold">Shipments</Text>
      </View>
      {user?.role === UserRole.SHIPPER && (
        <View className="p-4">
          <Button title="+ New Shipment" onPress={() => router.push('/(app)/create-shipment')} />
        </View>
      )}
      <ScrollView className="flex-1 px-4">
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : shipments.length === 0 ? (
          <Text className="text-gray-400 text-center py-12">No shipments found</Text>
        ) : (
          shipments.map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              onPress={() => router.push(`/(app)/shipment/${s.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
