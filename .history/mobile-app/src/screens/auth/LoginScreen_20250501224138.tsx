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
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Login successful:', data.user?.id);
      
    } catch (error: any) {
      console.error('Login error:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StyledView className="flex-1 bg-white">
      <StyledView className="flex-1 justify-center px-6">
        <StyledView className="mb-12">
          <StyledText className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </StyledText>
          <StyledText className="text-gray-600 text-base">
            Please sign in to your account
          </StyledText>
        </StyledView>

        <StyledView className="space-y-4">
          <StyledView>
            <StyledText className="text-gray-700 mb-2 text-base">
              Email
            </StyledText>
            <StyledTextInput
              className="w-full bg-gray-100 p-4 rounded-lg text-gray-900"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
            />
          </StyledView>

          <StyledView>
            <StyledText className="text-gray-700 mb-2 text-base">
              Password
            </StyledText>
            <StyledTextInput
              className="w-full bg-gray-100 p-4 rounded-lg text-gray-900"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
            />
          </StyledView>
        </StyledView>

        <StyledTouchableOpacity
          className={`mt-6 p-4 rounded-lg ${
            loading ? 'bg-blue-400' : 'bg-blue-500'
          }`}
          onPress={handleLogin}
          disabled={loading}
        >
          <StyledText className="text-white text-center font-semibold text-lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={() => navigation.navigate('Register')}
          className="mt-4"
        >
          <StyledText className="text-center text-blue-500 text-base">
            Don't have an account? Sign up
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
} 