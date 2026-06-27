import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShipmentStore } from '../../../src/stores/shipmentStore';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { Button } from '../../../src/components/Button';
import { LoadingState } from '../../../src/components/LoadingState';
import { MapTracking } from '../../../src/components/MapTracking';
import { ShipmentStatus } from '@logistics/shared';
import { useAuthStore } from '../../../src/stores/authStore';
import { UserRole } from '@logistics/shared';

export default function ShipmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { selectedShipment, fetchShipment, updateStatus, isLoading } = useShipmentStore();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchShipment(id);
  }, [id, fetchShipment]);

  const shipment = selectedShipment;

  const handleStatusUpdate = async (status: ShipmentStatus) => {
    if (!id) return;
    setUpdating(true);
    try {
      await updateStatus(id, status);
      Alert.alert('Success', `Status updated to ${status}`);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || !shipment) return <LoadingState message="Loading shipment..." />;

  const isDriver = user?.role === UserRole.DRIVER;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Button title="← Back" onPress={() => router.back()} variant="outline" style={{ marginBottom: 16, alignSelf: 'flex-start' }} />

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold">{shipment.trackingNumber}</Text>
            <StatusBadge status={shipment.status} />
          </View>
          <Text className="text-gray-600 mb-1">
            From: {shipment.pickupCity}, {shipment.pickupState}
          </Text>
          <Text className="text-gray-600 mb-3">
            To: {shipment.deliveryCity}, {shipment.deliveryState}
          </Text>
          <Text className="text-gray-400 text-sm">
            Type: {shipment.shipmentType} • Weight: {shipment.weight} kg • Priority: {shipment.priority}
          </Text>
          {shipment.estimatedDeliveryAt && (
            <Text className="text-primary-600 text-sm mt-2">
              ETA: {new Date(shipment.estimatedDeliveryAt).toLocaleString()}
              {shipment.etaConfidence && ` (${Math.round(shipment.etaConfidence * 100)}% confidence)`}
            </Text>
          )}
        </View>

        <MapTracking />

        <View className="flex-row gap-2 mt-4 mb-4">
          <Button
            title="Live Tracking"
            onPress={() => router.push(`/(app)/tracking?id=${id}`)}
            style={{ flex: 1 }}
          />
          <Button
            title="Payment"
            onPress={() => router.push(`/(app)/payment?id=${id}`)}
            variant="outline"
            style={{ flex: 1 }}
          />
        </View>

        {isDriver && shipment.status === 'ASSIGNED' && (
          <Button title="Start Pickup" onPress={() => handleStatusUpdate(ShipmentStatus.PICKED_UP)} loading={updating} />
        )}
        {isDriver && shipment.status === 'PICKED_UP' && (
          <Button title="Start Transit" onPress={() => handleStatusUpdate(ShipmentStatus.IN_TRANSIT)} loading={updating} />
        )}
        {isDriver && shipment.status === 'IN_TRANSIT' && (
          <Button title="Proof of Delivery" onPress={() => router.push(`/(app)/proof-of-delivery?id=${id}`)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
