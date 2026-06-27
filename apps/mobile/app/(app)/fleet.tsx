import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { LoadingState } from '../../src/components/LoadingState';
import { Button } from '../../src/components/Button';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  status: string;
  capacityWeight: number;
}

interface Driver {
  id: string;
  rating: number;
  isAvailable: boolean;
  user: { firstName: string; lastName: string; email: string };
}

export default function FleetScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [utilization, setUtilization] = useState<{ totalVehicles: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Vehicle[]>('/fleet/vehicles'),
      api.get<Driver[]>('/fleet/drivers'),
      api.get<{ totalVehicles: number }>('/fleet/utilization'),
    ])
      .then(([v, d, u]) => {
        setVehicles(v);
        setDrivers(d);
        setUtilization(u);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading fleet..." />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Fleet Management</Text>

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-3xl font-bold text-primary-600">{utilization?.totalVehicles || 0}</Text>
          <Text className="text-gray-500">Total Vehicles</Text>
        </View>

        <Text className="text-lg font-semibold mb-3">Vehicles</Text>
        {vehicles.map((v) => (
          <View key={v.id} className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
            <Text className="font-bold">{v.plateNumber}</Text>
            <Text className="text-gray-600">{v.make} {v.model}</Text>
            <Text className="text-gray-400 text-sm">{v.status} • {v.capacityWeight}kg capacity</Text>
          </View>
        ))}

        <Text className="text-lg font-semibold mb-3 mt-4">Drivers</Text>
        {drivers.map((d) => (
          <View key={d.id} className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
            <Text className="font-bold">{d.user.firstName} {d.user.lastName}</Text>
            <Text className="text-gray-600">{d.user.email}</Text>
            <Text className="text-gray-400 text-sm">
              Rating: {d.rating} • {d.isAvailable ? 'Available' : 'Busy'}
            </Text>
          </View>
        ))}

        <Button title="View Maintenance" onPress={() => api.get('/fleet/maintenance').then(console.log)} variant="outline" style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
