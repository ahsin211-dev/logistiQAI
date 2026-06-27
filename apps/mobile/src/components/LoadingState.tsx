import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="text-gray-500 mt-4">{message}</Text>
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-red-500 text-center text-base">{message}</Text>
    </View>
  );
}
