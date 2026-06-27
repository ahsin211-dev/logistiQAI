import { useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { api } from '../../src/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
}

export default function AiChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help with shipment status, tracking, and logistics questions. I only answer based on real data in our system.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post<{ reply: string; confidence?: number }>('/ai/chat', {
        message: userMsg,
      });
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.reply, confidence: res.confidence },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Sorry, I couldn't process that: ${(err as Error).message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold">AI Assistant</Text>
        <Text className="text-gray-500 text-sm">Answers based on real shipment data only</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <ScrollView className="flex-1 p-4">
          {messages.map((msg, i) => (
            <View
              key={i}
              className={`mb-3 max-w-[85%] rounded-2xl p-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 self-end'
                  : 'bg-white border border-gray-200 self-start'
              }`}
            >
              <Text className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}>
                {msg.content}
              </Text>
              {msg.confidence !== undefined && (
                <Text className="text-gray-400 text-xs mt-1">
                  Confidence: {Math.round(msg.confidence * 100)}%
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
        <View className="flex-row p-4 border-t border-gray-200 bg-white gap-2">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 bg-white"
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your shipments..."
            multiline
          />
          <Button title="Send" onPress={sendMessage} loading={loading} style={{ paddingHorizontal: 16 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
