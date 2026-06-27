import { View, Text } from 'react-native';
import { ShipmentStatus } from '@logistics/shared';

const statusColors: Record<ShipmentStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  PICKUP_SCHEDULED: 'bg-indigo-100 text-indigo-700',
  PICKED_UP: 'bg-yellow-100 text-yellow-700',
  IN_TRANSIT: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

interface StatusBadgeProps {
  status: ShipmentStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = statusColors[status as ShipmentStatus] || 'bg-gray-100 text-gray-700';
  const [bg, text] = colors.split(' ');

  return (
    <View className={`px-3 py-1 rounded-full ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}
