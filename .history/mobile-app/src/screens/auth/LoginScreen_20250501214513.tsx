import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  async function handleLogin() {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StyledView className="flex-1 bg-white p-6 justify-center">
      <StyledView className="space-y-6">
        <StyledText className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </StyledText>
        <StyledText className="text-center text-gray-500">
          Sign in to continue
        </StyledText>
        
        <StyledView className="space-y-4">
          <StyledTextInput
            className="bg-gray-50 p-4 rounded-lg text-gray-800"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <StyledTextInput
            className="bg-gray-50 p-4 rounded-lg text-gray-800"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </StyledView>

        <StyledTouchableOpacity
          className={`p-4 rounded-lg ${loading ? 'bg-blue-300' : 'bg-blue-500'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          <StyledText className="text-white text-center font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={() => navigation.navigate('Register')}
          className="p-4"
        >
          <StyledText className="text-center text-blue-500">
            Don't have an account? Sign up
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
} 