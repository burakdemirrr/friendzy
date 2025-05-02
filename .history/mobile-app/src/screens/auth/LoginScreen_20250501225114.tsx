import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
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
const StyledImage = styled(Image);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

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
    <StyledLinearGradient
      colors={['#1E293B', '#0F172A']}
      className="flex-1"
    >
      <StyledKeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledView className="flex-1 justify-between">
          {/* Top Section */}
          <StyledView className="pt-20 px-6">
            <StyledText className="text-5xl font-bold text-white mb-3">
              Welcome{'\n'}back
            </StyledText>
            <StyledText className="text-gray-400 text-lg">
              Sign in to continue
            </StyledText>
          </StyledView>

          {/* Form Section */}
          <StyledView className="bg-white rounded-t-3xl px-6 pt-8 pb-6 space-y-6">
            <StyledView>
              <StyledText className="text-gray-700 text-base font-medium mb-2">
                Email
              </StyledText>
              <StyledView className="bg-gray-50 rounded-xl border border-gray-100">
                <StyledTextInput
                  className="w-full px-4 py-3.5 text-gray-900 rounded-xl"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                />
              </StyledView>
            </StyledView>

            <StyledView>
              <StyledText className="text-gray-700 text-base font-medium mb-2">
                Password
              </StyledText>
              <StyledView className="bg-gray-50 rounded-xl border border-gray-100">
                <StyledTextInput
                  className="w-full px-4 py-3.5 text-gray-900 rounded-xl"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                />
              </StyledView>
            </StyledView>

            <StyledTouchableOpacity
              className={`mt-6 ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600'
              } rounded-xl shadow-lg shadow-indigo-600/20`}
              onPress={handleLogin}
              disabled={loading}
            >
              <StyledLinearGradient
                colors={loading ? ['#818CF8', '#6366F1'] : ['#4F46E5', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full py-4 rounded-xl"
              >
                <StyledText className="text-white text-center font-bold text-lg">
                  {loading ? 'Signing in...' : 'Sign In'}
                </StyledText>
              </StyledLinearGradient>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => navigation.navigate('Register')}
              className="mt-4"
            >
              <StyledText className="text-center text-gray-600 text-base">
                Don't have an account? <StyledText className="text-indigo-600 font-semibold">Sign up</StyledText>
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledKeyboardAvoidingView>
    </StyledLinearGradient>
  );
} 