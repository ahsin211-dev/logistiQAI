import { View, Text } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';

interface MapTrackingProps {
  pickup?: { latitude: number; longitude: number };
  delivery?: { latitude: number; longitude: number };
  driverLocation?: { latitude: number; longitude: number };
  route?: Array<{ latitude: number; longitude: number }>;
  region?: Region;
}

export function MapTracking({
  pickup,
  delivery,
  driverLocation,
  route,
  region,
}: MapTrackingProps) {
  const defaultRegion: Region = region || {
    latitude: pickup?.latitude || 37.7749,
    longitude: pickup?.longitude || -122.4194,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View className="h-64 rounded-2xl overflow-hidden border border-gray-200">
      <MapView style={{ flex: 1 }} initialRegion={defaultRegion}>
        {pickup && (
          <Marker coordinate={pickup} title="Pickup" pinColor="green" />
        )}
        {delivery && (
          <Marker coordinate={delivery} title="Delivery" pinColor="red" />
        )}
        {driverLocation && (
          <Marker coordinate={driverLocation} title="Driver" pinColor="blue" />
        )}
        {route && route.length > 1 && (
          <Polyline coordinates={route} strokeColor="#2563eb" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
}

export function MapPlaceholder() {
  return (
    <View className="h-64 rounded-2xl bg-gray-100 items-center justify-center border border-gray-200">
      <Text className="text-gray-400">Map requires device/emulator with Google Maps</Text>
    </View>
  );
}
