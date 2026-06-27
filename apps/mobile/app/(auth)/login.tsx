import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    setErrors({});
    if (!email) return setErrors({ email: 'Email required' });
    if (!password || password.length < 8) return setErrors({ password: 'Min 8 characters' });

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(app)');
    } catch (err) {
      Alert.alert('Login Failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center p-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome back</Text>
        <Text className="text-gray-500 mb-8">Sign in to your logistics account</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
          placeholder="••••••••"
        />

        <Button title="Sign In" onPress={handleLogin} loading={loading} />

        <Button
          title="Create Account"
          onPress={() => router.push('/(auth)/register')}
          variant="outline"
          style={{ marginTop: 12 }}
        />

        <Text className="text-gray-400 text-xs text-center mt-8">
          Demo: shipper@example.com / driver@acmelogistics.com{'\n'}
          Password: Password123!
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
