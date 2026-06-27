import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-medium mb-1.5">{label}</Text>}
      <TextInput
        className={`border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-white ${error ? 'border-red-500' : ''} ${className || ''}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}
