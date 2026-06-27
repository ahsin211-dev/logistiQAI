import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { MapTracking } from '../../src/components/MapTracking';
import { Button } from '../../src/components/Button';
import { LoadingState } from '../../src/components/LoadingState';
import { StatusBadge } from '../../src/components/StatusBadge';
import { subscribeToShipment } from '../../src/services/tracking';

interface TrackingData {
  status: string;
  estimatedDeliveryAt?: string;
  etaConfidence?: number;
  driver?: {
    currentLat?: number;
    currentLng?: number;
    lastLocationAt?: string;
    user?: { firstName: string; lastName: string };
  };
  locations: Array<{ latitude: number; longitude: number; recordedAt: string }>;
}

export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<TrackingData>(`/tracking/${id}`).then(setTracking);

    const unsubscribe = subscribeToShipment(id, (data) => {
      const payload = data as { location?: { latitude: number; longitude: number } };
      if (payload.location) {
        setLiveLocation({ latitude: payload.location.latitude, longitude: payload.location.longitude });
      }
    });

    return unsubscribe;
  }, [id]);

  if (!tracking) return <LoadingState message="Loading tracking..." />;

  const driverLoc = liveLocation || (tracking.driver?.currentLat
    ? { latitude: tracking.driver.currentLat, longitude: tracking.driver.currentLng! }
    : undefined);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Button title="← Back" onPress={() => router.back()} variant="outline" style={{ marginBottom: 16, alignSelf: 'flex-start' }} />
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold">Live Tracking</Text>
          <StatusBadge status={tracking.status} />
        </View>

        <MapTracking
          driverLocation={driverLoc}
          route={tracking.locations.map((l) => ({ latitude: l.latitude, longitude: l.longitude }))}
        />

        {tracking.driver?.user && (
          <View className="bg-white rounded-2xl p-4 mt-4 border border-gray-100">
            <Text className="text-gray-500 text-sm">Driver</Text>
            <Text className="font-semibold">
              {tracking.driver.user.firstName} {tracking.driver.user.lastName}
            </Text>
            {tracking.driver.lastLocationAt && (
              <Text className="text-gray-400 text-xs mt-1">
                Last update: {new Date(tracking.driver.lastLocationAt).toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {tracking.estimatedDeliveryAt && (
          <View className="bg-white rounded-2xl p-4 mt-4 border border-gray-100">
            <Text className="text-gray-500 text-sm">Estimated Delivery</Text>
            <Text className="font-semibold text-primary-600">
              {new Date(tracking.estimatedDeliveryAt).toLocaleString()}
            </Text>
            {tracking.etaConfidence && (
              <Text className="text-gray-400 text-xs">
                Confidence: {Math.round(tracking.etaConfidence * 100)}%
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
