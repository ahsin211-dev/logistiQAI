import { View, Text, TouchableOpacity } from 'react-native';
import { StatusBadge } from './StatusBadge';
import type { Shipment } from '../stores/shipmentStore';

interface ShipmentCardProps {
  shipment: Shipment;
  onPress: () => void;
}

export function ShipmentCard({ shipment, onPress }: ShipmentCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-bold text-gray-900 text-base">{shipment.trackingNumber}</Text>
        <StatusBadge status={shipment.status} />
      </View>
      <Text className="text-gray-600 text-sm mb-1">
        {shipment.pickupCity}, {shipment.pickupState} → {shipment.deliveryCity},{' '}
        {shipment.deliveryState}
      </Text>
      <View className="flex-row justify-between mt-2">
        <Text className="text-gray-400 text-xs">{shipment.shipmentType}</Text>
        <Text className="text-gray-400 text-xs">{shipment.weight} kg</Text>
      </View>
    </TouchableOpacity>
  );
}
