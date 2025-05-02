import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);

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
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

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
    <StyledLinearGradient
      colors={['#4F46E5', '#3B82F6', '#60A5FA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <StyledView className="flex-1 justify-center px-6">
        <StyledView className="mb-12">
          <StyledText className="text-4xl font-bold text-white mb-2">
            Create Account
          </StyledText>
          <StyledText className="text-gray-100 text-lg">
            Sign up to get started
          </StyledText>
        </StyledView>

        <StyledView className="space-y-6">
          <StyledView>
            <StyledText className="text-white mb-2 text-base font-medium">
              Email
            </StyledText>
            <StyledView className="bg-white/20 rounded-xl">
              <StyledTextInput
                className="w-full p-4 text-white"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                style={{ color: 'white' }}
              />
            </StyledView>
          </StyledView>

          <StyledView>
            <StyledText className="text-white mb-2 text-base font-medium">
              Password
            </StyledText>
            <StyledView className="bg-white/20 rounded-xl">
              <StyledTextInput
                className="w-full p-4 text-white"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                style={{ color: 'white' }}
              />
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledTouchableOpacity
          className={`mt-8 p-4 rounded-xl bg-white/20 ${
            loading ? 'opacity-70' : ''
          }`}
          onPress={handleRegister}
          disabled={loading}
        >
          <StyledText className="text-white text-center font-bold text-lg">
            {loading ? 'Creating account...' : 'Create Account'}
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="mt-6"
        >
          <StyledText className="text-center text-white text-base">
            Already have an account? <StyledText className="font-bold">Sign in</StyledText>
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledLinearGradient>
  );
} 