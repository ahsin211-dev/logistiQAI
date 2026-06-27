import Constants from 'expo-constants';

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3000/api/v1';

export const WS_URL =
  Constants.expoConfig?.extra?.wsUrl ||
  process.env.EXPO_PUBLIC_WS_URL ||
  'http://localhost:3000';
