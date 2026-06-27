import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { useShipmentStore } from '../../src/stores/shipmentStore';
import { ShipmentCard } from '../../src/components/ShipmentCard';
import { Button } from '../../src/components/Button';
import { LoadingState } from '../../src/components/LoadingState';
import { UserRole } from '@logistics/shared';

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { shipments, fetchShipments, isLoading } = useShipmentStore();

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const isDriver = user?.role === UserRole.DRIVER;
  const isFleet = user?.role === UserRole.FLEET_MANAGER || user?.role === UserRole.TRANSPORT_COMPANY;
  const isShipper = user?.role === UserRole.SHIPPER;

  const activeCount = shipments.filter((s) =>
    ['ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT'].includes(s.status),
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-gray-500 text-sm">Welcome back,</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-primary-600 text-sm font-medium mt-1">{user?.role}</Text>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
            <Text className="text-3xl font-bold text-primary-600">{activeCount}</Text>
            <Text className="text-gray-500 text-sm">Active</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
            <Text className="text-3xl font-bold text-green-600">
              {shipments.filter((s) => s.status === 'DELIVERED').length}
            </Text>
            <Text className="text-gray-500 text-sm">Delivered</Text>
          </View>
        </View>

        {isShipper && (
          <Button
            title="+ Create Shipment"
            onPress={() => router.push('/(app)/create-shipment')}
            style={{ marginBottom: 16 }}
          />
        )}

        {isDriver && activeCount > 0 && (
          <Button
            title="Start Active Trip"
            onPress={() => {
              const active = shipments.find((s) =>
                ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(s.status),
              );
              if (active) router.push(`/(app)/active-trip?id=${active.id}`);
            }}
            style={{ marginBottom: 16 }}
          />
        )}

        {isFleet && (
          <Button
            title="Fleet Dashboard"
            onPress={() => router.push('/(app)/fleet')}
            variant="outline"
            style={{ marginBottom: 16 }}
          />
        )}

        <Text className="text-lg font-semibold text-gray-900 mb-3">Recent Shipments</Text>
        {isLoading ? (
          <LoadingState />
        ) : shipments.length === 0 ? (
          <Text className="text-gray-400 text-center py-8">No shipments yet</Text>
        ) : (
          shipments.slice(0, 5).map((s) => (
            <ShipmentCard
              key={s.id}
              shipment={s}
              onPress={() => router.push(`/(app)/shipment/${s.id}`)}
            />
          ))
        )}

        {shipments.length > 5 && (
          <TouchableOpacity onPress={() => router.push('/(app)/shipments')}>
            <Text className="text-primary-600 text-center py-4 font-medium">View all shipments</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
