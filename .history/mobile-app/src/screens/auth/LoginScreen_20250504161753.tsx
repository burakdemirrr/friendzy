import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, Dimensions, Animated } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../styles/theme';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
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
      setIsLoading(false);
    }
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <StyledKeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledView className="flex-1 justify-between px-6">
          {/* Top Section */}
          <StyledView className="pt-12">
            <StyledView className="mb-8">
              <StyledView 
                className="h-16 w-16 rounded-2xl items-center justify-center mb-6"
                style={{
                  backgroundColor: `${colors.primary}10`,
                  ...shadows.sm
                }}
              >
                <Ionicons name="lock-closed" size={32} color={colors.primary} />
              </StyledView>
              <StyledText 
                className="text-[34px] font-bold mb-2"
                style={{ 
                  color: colors.text.primary,
                  letterSpacing: 0.37
                }}
              >
                Welcome back
              </StyledText>
              <StyledText 
                className="text-base"
                style={{ 
                  color: colors.text.secondary,
                  letterSpacing: -0.41
                }}
              >
                Sign in to continue
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Form Section */}
          <StyledView className="space-y-6 mb-8">
            <StyledView>
              <StyledText 
                className="text-sm font-medium mb-2 ml-1"
                style={{ color: colors.text.secondary }}
              >
                Email Address
              </StyledText>
              <StyledView 
                className="rounded-xl flex-row items-center px-4"
                style={{ 
                  backgroundColor: colors.background.secondary,
                  ...shadows.sm
                }}
              >
                <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                <StyledTextInput
                  className="flex-1 py-3.5 px-3 text-base"
                  style={{ 
                    color: colors.text.primary,
                    fontSize: typography.body.fontSize,
                    letterSpacing: typography.body.letterSpacing
                  }}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Enter your email"
                  placeholderTextColor={colors.text.muted}
                />
              </StyledView>
            </StyledView>

            <StyledView>
              <StyledText 
                className="text-sm font-medium mb-2 ml-1"
                style={{ color: colors.text.secondary }}
              >
                Password
              </StyledText>
              <StyledView 
                className="rounded-xl flex-row items-center px-4"
                style={{ 
                  backgroundColor: colors.background.secondary,
                  ...shadows.sm
                }}
              >
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
                <StyledTextInput
                  className="flex-1 py-3.5 px-3 text-base"
                  style={{ 
                    color: colors.text.primary,
                    fontSize: typography.body.fontSize,
                    letterSpacing: typography.body.letterSpacing
                  }}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.text.muted}
                />
                <StyledTouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.text.secondary}
                  />
                </StyledTouchableOpacity>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Bottom Section */}
          <StyledView className="space-y-4 mb-8">
            <StyledTouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="h-[52px] rounded-xl items-center justify-center"
              style={{ 
                backgroundColor: colors.primary,
                ...shadows.sm
              }}
            >
              <StyledText 
                className="text-base font-semibold"
                style={{ 
                  color: colors.text.white,
                  letterSpacing: -0.41
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => navigation.navigate('Register')}
              className="h-[52px] rounded-xl items-center justify-center"
              style={{ 
                backgroundColor: colors.background.secondary,
                ...shadows.sm
              }}
            >
              <StyledText 
                className="text-base font-semibold"
                style={{ 
                  color: colors.primary,
                  letterSpacing: -0.41
                }}
              >
                Create Account
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
} 