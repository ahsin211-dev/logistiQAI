import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { UserRole } from '@logistics/shared';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/stores/authStore';

const ROLES = [
  { value: UserRole.SHIPPER, label: 'Shipper', desc: 'Create and track shipments' },
  { value: UserRole.DRIVER, label: 'Driver', desc: 'Deliver shipments' },
  { value: UserRole.FLEET_MANAGER, label: 'Fleet Manager', desc: 'Manage fleet & drivers' },
  { value: UserRole.TRANSPORT_COMPANY, label: 'Transport Company', desc: 'Company operations' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<UserRole>(UserRole.SHIPPER);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);

  const needsCompany = [UserRole.DRIVER, UserRole.FLEET_MANAGER, UserRole.TRANSPORT_COMPANY].includes(role);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register({
        ...form,
        role,
        companyName: needsCompany ? form.companyName : undefined,
      });
      router.replace('/(app)');
    } catch (err) {
      Alert.alert('Registration Failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'role') {
    return (
      <ScrollView className="flex-1 bg-white p-6">
        <Text className="text-2xl font-bold mb-2">Select your role</Text>
        <Text className="text-gray-500 mb-6">Choose how you'll use the platform</Text>
        {ROLES.map((r) => (
          <Button
            key={r.value}
            title={`${r.label} — ${r.desc}`}
            variant={role === r.value ? 'primary' : 'outline'}
            onPress={() => {
              setRole(r.value);
              setStep('form');
            }}
            style={{ marginBottom: 8 }}
          />
        ))}
        <Button title="Back to Login" onPress={() => router.back()} variant="secondary" style={{ marginTop: 16 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Create Account</Text>
      <Input label="First Name" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
      <Input label="Last Name" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
      <Input label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Password" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
      {needsCompany && (
        <Input label="Company Name" value={form.companyName} onChangeText={(v) => setForm({ ...form, companyName: v })} />
      )}
      <Button title="Register" onPress={handleRegister} loading={loading} />
      <Button title="Back" onPress={() => setStep('role')} variant="outline" style={{ marginTop: 12 }} />
    </ScrollView>
  );
}
