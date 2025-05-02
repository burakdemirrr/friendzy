import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledLinearGradient = styled(LinearGradient);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StatusBar barStyle="light-content" />
      <StyledKeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledView className="flex-1 justify-between">
          {/* Top Section */}
          <StyledView className="px-6 pt-12">
            <StyledView className="mb-8">
              <StyledView className="h-12 w-12 bg-indigo-500/20 rounded-2xl items-center justify-center mb-6">
                <Ionicons name="person-add" size={24} color="#818CF8" />
              </StyledView>
              <StyledText className="text-5xl font-bold text-white mb-3 tracking-tight">
                Create{'\n'}Account
              </StyledText>
              <StyledText className="text-gray-400 text-lg">
                Sign up to get started
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Form Section */}
          <StyledView className="bg-[#151B2C] rounded-t-[32px] px-6 pt-8 pb-6">
            <StyledView className="space-y-5">
              <StyledView>
                <StyledText className="text-gray-300 text-base font-medium mb-3 ml-1">
                  Email Address
                </StyledText>
                <StyledView className="bg-[#1C2438] rounded-2xl flex-row items-center px-4">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  <StyledTextInput
                    className="flex-1 py-4 px-3 text-white text-base"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="Enter your email"
                    placeholderTextColor="#6B7280"
                  />
                </StyledView>
              </StyledView>

              <StyledView>
                <StyledText className="text-gray-300 text-base font-medium mb-3 ml-1">
                  Password
                </StyledText>
                <StyledView className="bg-[#1C2438] rounded-2xl flex-row items-center px-4">
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                  <StyledTextInput
                    className="flex-1 py-4 px-3 text-white text-base"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#6B7280"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </StyledView>
              </StyledView>

              <StyledTouchableOpacity
                className="mt-6"
                onPress={handleRegister}
                disabled={loading}
              >
                <StyledLinearGradient
                  colors={loading ? ['#4F46E5', '#4338CA'] : ['#6366F1', '#4F46E5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full py-4 rounded-2xl"
                >
                  <StyledView className="flex-row items-center justify-center space-x-2">
                    {loading && <Ionicons name="sync" size={20} color="white" />}
                    <StyledText className="text-white text-center font-bold text-lg">
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </StyledText>
                  </StyledView>
                </StyledLinearGradient>
              </StyledTouchableOpacity>

              <StyledTouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="mt-4"
              >
                <StyledText className="text-center text-gray-400 text-base">
                  Already have an account? <StyledText className="text-indigo-400 font-semibold">Sign in</StyledText>
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
} 