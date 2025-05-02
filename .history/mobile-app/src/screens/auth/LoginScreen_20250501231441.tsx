import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Dimensions } from 'react-native';
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

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!profile) {
          navigation.navigate('Onboarding');
        } else {
          navigation.navigate('Home');
        }
      }
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
          <StyledView className="px-6 pt-8">
            <StyledView className="mb-6">
              <StyledView className="h-14 w-14 bg-indigo-500/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={28} color="#818CF8" />
              </StyledView>
              <StyledText className="text-4xl font-bold text-white mb-2 tracking-tight">
                Welcome back
              </StyledText>
              <StyledText className="text-gray-400 text-base">
                Sign in to continue
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Form Section */}
          <StyledView className="bg-[#151B2C] rounded-t-[32px] px-6 pt-8 pb-8">
            <StyledView className="space-y-6">
              <StyledView>
                <StyledText className="text-gray-300 text-sm font-medium mb-2 ml-1">
                  Email Address
                </StyledText>
                <StyledView className="bg-[#1C2438] rounded-xl flex-row items-center px-4">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  <StyledTextInput
                    className="flex-1 py-3.5 px-3 text-white text-base"
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
                <StyledText className="text-gray-300 text-sm font-medium mb-2 ml-1">
                  Password
                </StyledText>
                <StyledView className="bg-[#1C2438] rounded-xl flex-row items-center px-4">
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                  <StyledTextInput
                    className="flex-1 py-3.5 px-3 text-white text-base"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#6B7280"
                  />
                  <StyledTouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-2"
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>

              <StyledTouchableOpacity
                className="mt-2"
                onPress={handleLogin}
                disabled={loading}
              >
                <StyledLinearGradient
                  colors={loading ? ['#4F46E5', '#4338CA'] : ['#6366F1', '#4F46E5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full py-4 rounded-xl"
                >
                  <StyledView className="flex-row items-center justify-center space-x-2">
                    {loading && <Ionicons name="sync" size={20} color="white" />}
                    <StyledText className="text-white text-center font-bold text-base">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </StyledText>
                  </StyledView>
                </StyledLinearGradient>
              </StyledTouchableOpacity>

              <StyledTouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="mt-4"
              >
                <StyledText className="text-center text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <StyledText className="text-indigo-400 font-semibold">
                    Sign up
                  </StyledText>
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
} 