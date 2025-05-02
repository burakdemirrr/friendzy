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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  async function handleRegister() {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      Alert.alert('Success', 'Registration successful! Please check your email for verification.');
      navigation.navigate('Login');
    } catch (error: any) {
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
            Create Account
          </StyledText>
          <StyledText className="text-gray-600 text-base">
            Sign up to get started
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
          onPress={handleRegister}
          disabled={loading}
        >
          <StyledText className="text-white text-center font-semibold text-lg">
            {loading ? 'Creating account...' : 'Create Account'}
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="mt-4"
        >
          <StyledText className="text-center text-blue-500 text-base">
            Already have an account? Sign in
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
} 