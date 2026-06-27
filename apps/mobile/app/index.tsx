import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { hydrate, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        router.replace(isAuthenticated ? '/(app)' : '/(auth)/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View className="flex-1 bg-primary-800 items-center justify-center">
      <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-6">
        <Text className="text-4xl">🚚</Text>
      </View>
      <Text className="text-white text-3xl font-bold mb-2">Logistics</Text>
      <Text className="text-primary-100 text-base mb-8">AI-Powered Platform</Text>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
