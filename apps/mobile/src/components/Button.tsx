import { View, Text, TouchableOpacity, ActivityIndicator, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const variants = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-gray-600 active:bg-gray-700',
  danger: 'bg-red-600 active:bg-red-700',
  outline: 'bg-transparent border-2 border-primary-600',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  danger: 'text-white',
  outline: 'text-primary-600',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-xl py-4 px-6 items-center justify-center ${variants[variant]} ${disabled ? 'opacity-50' : ''}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#fff'} />
      ) : (
        <Text className={`font-semibold text-base ${textVariants[variant]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
