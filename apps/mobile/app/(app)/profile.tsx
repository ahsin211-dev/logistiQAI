import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-2xl p-6 mb-4 border border-gray-100 items-center">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl text-primary-600 font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <Text className="text-xl font-bold">{user?.firstName} {user?.lastName}</Text>
          <Text className="text-gray-500">{user?.email}</Text>
          <Text className="text-primary-600 font-medium mt-1">{user?.role}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="font-semibold text-gray-700 mb-2">Account Settings</Text>
          <Text className="text-gray-500 text-sm">Profile management and driver verification</Text>
        </View>

        <Button title="Sign Out" onPress={handleLogout} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}
