import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShipmentPriority } from '@logistics/shared';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useShipmentStore } from '../../src/stores/shipmentStore';

export default function CreateShipmentScreen() {
  const router = useRouter();
  const createShipment = useShipmentStore((s) => s.createShipment);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shipmentType: 'Standard',
    weight: '100',
    volume: '10',
    priority: ShipmentPriority.NORMAL,
    pickupStreet: '',
    pickupCity: '',
    pickupState: '',
    pickupPostalCode: '',
    pickupCountry: 'US',
    deliveryStreet: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPostalCode: '',
    deliveryCountry: 'US',
    itemDescription: 'General cargo',
    itemQuantity: '1',
    itemWeight: '100',
    notes: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const shipment = await createShipment({
        shipmentType: form.shipmentType,
        weight: parseFloat(form.weight),
        volume: parseFloat(form.volume),
        priority: form.priority,
        notes: form.notes || undefined,
        pickupAddress: {
          street: form.pickupStreet,
          city: form.pickupCity,
          state: form.pickupState,
          postalCode: form.pickupPostalCode,
          country: form.pickupCountry,
        },
        deliveryAddress: {
          street: form.deliveryStreet,
          city: form.deliveryCity,
          state: form.deliveryState,
          postalCode: form.deliveryPostalCode,
          country: form.deliveryCountry,
        },
        items: [
          {
            description: form.itemDescription,
            quantity: parseInt(form.itemQuantity, 10),
            weight: parseFloat(form.itemWeight),
          },
        ],
      });
      Alert.alert('Success', `Shipment ${shipment.trackingNumber} created`);
      router.replace(`/(app)/shipment/${shipment.id}`);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-6">Create Shipment</Text>

        <Text className="font-semibold text-gray-700 mb-2">Pickup Address</Text>
        <Input label="Street" value={form.pickupStreet} onChangeText={(v) => setForm({ ...form, pickupStreet: v })} />
        <Input label="City" value={form.pickupCity} onChangeText={(v) => setForm({ ...form, pickupCity: v })} />
        <Input label="State" value={form.pickupState} onChangeText={(v) => setForm({ ...form, pickupState: v })} />
        <Input label="Postal Code" value={form.pickupPostalCode} onChangeText={(v) => setForm({ ...form, pickupPostalCode: v })} />

        <Text className="font-semibold text-gray-700 mb-2 mt-4">Delivery Address</Text>
        <Input label="Street" value={form.deliveryStreet} onChangeText={(v) => setForm({ ...form, deliveryStreet: v })} />
        <Input label="City" value={form.deliveryCity} onChangeText={(v) => setForm({ ...form, deliveryCity: v })} />
        <Input label="State" value={form.deliveryState} onChangeText={(v) => setForm({ ...form, deliveryState: v })} />
        <Input label="Postal Code" value={form.deliveryPostalCode} onChangeText={(v) => setForm({ ...form, deliveryPostalCode: v })} />

        <Text className="font-semibold text-gray-700 mb-2 mt-4">Shipment Details</Text>
        <Input label="Type" value={form.shipmentType} onChangeText={(v) => setForm({ ...form, shipmentType: v })} />
        <Input label="Weight (kg)" value={form.weight} onChangeText={(v) => setForm({ ...form, weight: v })} keyboardType="numeric" />
        <Input label="Notes" value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline />

        <Button title="Create Shipment" onPress={handleSubmit} loading={loading} style={{ marginTop: 16, marginBottom: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
