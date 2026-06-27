import { useState } from 'react';
import { View, Text, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { api } from '../../src/services/api';

export default function ProofOfDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image || !id) {
      Alert.alert('Required', 'Please capture proof of delivery photo');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'pod.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);
      formData.append('notes', notes);

      const token = await api.loadToken?.() || '';
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/shipments/${id}/proof-of-delivery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      Alert.alert('Delivered', 'Proof of delivery submitted successfully');
      router.replace('/(app)');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Proof of Delivery</Text>

      {image ? (
        <Image source={{ uri: image }} className="w-full h-64 rounded-2xl mb-4" resizeMode="cover" />
      ) : (
        <View className="w-full h-64 bg-gray-100 rounded-2xl items-center justify-center mb-4">
          <Text className="text-gray-400">No photo captured</Text>
        </View>
      )}

      <Button title="Capture Photo" onPress={pickImage} variant="outline" />
      <Input label="Delivery Notes" value={notes} onChangeText={setNotes} multiline placeholder="Recipient name, condition, etc." />
      <Button title="Submit & Complete Delivery" onPress={handleSubmit} loading={loading} style={{ marginTop: 16 }} />
    </SafeAreaView>
  );
}
