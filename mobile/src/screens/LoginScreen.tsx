import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { apiFetch } from '@/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      const res = await apiFetch<{ token: string; user: unknown }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password })
        }
      );
      Alert.alert('Logged in', res.token);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Login</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4 }}
      />
      <Button title="Login" onPress={onLogin} />
    </View>
  );
}
