import { useEffect, useState, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useShipmentStore } from '../../src/stores/shipmentStore';
import { MapTracking } from '../../src/components/MapTracking';
import { Button } from '../../src/components/Button';
import { LoadingState } from '../../src/components/LoadingState';
import { sendLocationUpdate } from '../../src/services/tracking';

export default function ActiveTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedShipment, fetchShipment } = useShipmentStore();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) fetchShipment(id);
  }, [id, fetchShipment]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for tracking');
        return;
      }

      const startTracking = async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          if (!mounted) return;
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setLocation(coords);
          if (id) {
            await sendLocationUpdate(id, coords.latitude, coords.longitude, {
              accuracy: loc.coords.accuracy ?? undefined,
              speed: loc.coords.speed ?? undefined,
              heading: loc.coords.heading ?? undefined,
            });
          }
        } catch {
          // Retry on next interval
        }
      };

      await startTracking();
      intervalRef.current = setInterval(startTracking, 15000);
    })();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id]);

  if (!selectedShipment) return <LoadingState message="Loading trip..." />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-2">Active Trip</Text>
        <Text className="text-gray-600 mb-4">{selectedShipment.trackingNumber}</Text>

        <MapTracking driverLocation={location || undefined} />

        <View className="bg-white rounded-2xl p-4 mt-4 border border-gray-100">
          <Text className="text-gray-500 text-sm">Destination</Text>
          <Text className="font-semibold text-lg">
            {selectedShipment.deliveryCity}, {selectedShipment.deliveryState}
          </Text>
          {location && (
            <Text className="text-gray-400 text-xs mt-2">
              GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          )}
        </View>

        <Button
          title="Complete Delivery"
          onPress={() => router.push(`/(app)/proof-of-delivery?id=${id}`)}
          style={{ marginTop: 16 }}
        />
        <Button title="Report Issue" onPress={() => Alert.alert('Issue Reported', 'Fleet manager has been notified')} variant="outline" style={{ marginTop: 8 }} />
      </View>
    </SafeAreaView>
  );
}
