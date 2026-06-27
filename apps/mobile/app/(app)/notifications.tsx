import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../src/services/api';
import { LoadingState } from '../../src/components/LoadingState';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    api.get<Notification[]>('/notifications')
      .then(setNotifications)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  if (loading) return <LoadingState />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold">Notifications</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        {notifications.length === 0 ? (
          <Text className="text-gray-400 text-center py-12">No notifications</Text>
        ) : (
          notifications.map((n) => (
            <TouchableOpacity
              key={n.id}
              onPress={() => markRead(n.id)}
              className={`bg-white rounded-xl p-4 mb-2 border ${n.isRead ? 'border-gray-100' : 'border-primary-200 bg-primary-50'}`}
            >
              <Text className="font-semibold">{n.title}</Text>
              <Text className="text-gray-600 text-sm mt-1">{n.body}</Text>
              <Text className="text-gray-400 text-xs mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
