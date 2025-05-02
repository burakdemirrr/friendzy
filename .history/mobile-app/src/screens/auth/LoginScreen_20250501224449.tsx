import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImageBackground = styled(ImageBackground);
const StyledLinearGradient = styled(LinearGradient);
const StyledBlurView = styled(BlurView);

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
    <StyledImageBackground
      source={require('../../../assets/auth-bg.jpg')}
      className="flex-1"
      resizeMode="cover"
    >
      <StyledLinearGradient
        colors={['rgba(59, 130, 246, 0.5)', 'rgba(37, 99, 235, 0.8)']}
        className="flex-1"
      >
        <StyledBlurView intensity={50} className="flex-1">
          <StyledView className="flex-1 justify-center px-6">
            <StyledView className="mb-12">
              <StyledText className="text-4xl font-bold text-white mb-2">
                Welcome back
              </StyledText>
              <StyledText className="text-gray-100 text-lg">
                Please sign in to your account
              </StyledText>
            </StyledView>

            <StyledView className="space-y-6">
              <StyledView>
                <StyledText className="text-white mb-2 text-base font-medium">
                  Email
                </StyledText>
                <StyledView className="bg-white/20 rounded-xl backdrop-blur-lg">
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
                <StyledView className="bg-white/20 rounded-xl backdrop-blur-lg">
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
              className={`mt-8 p-4 rounded-xl bg-white/20 backdrop-blur-lg ${
                loading ? 'opacity-70' : ''
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              <StyledText className="text-white text-center font-bold text-lg">
                {loading ? 'Signing in...' : 'Sign In'}
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => navigation.navigate('Register')}
              className="mt-6"
            >
              <StyledText className="text-center text-white text-base">
                Don't have an account? <StyledText className="font-bold">Sign up</StyledText>
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledBlurView>
      </StyledLinearGradient>
    </StyledImageBackground>
  );
} 