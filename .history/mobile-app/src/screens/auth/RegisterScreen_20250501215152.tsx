import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImageBackground = styled(ImageBackground);

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
    <StyledView className="flex-1 bg-gradient-to-b from-purple-600 to-indigo-500">
      <StyledView className="flex-1 justify-center px-8">
        <StyledView className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
          <StyledView className="space-y-6">
            <StyledView>
              <StyledText className="text-4xl font-bold text-center text-white mb-2">
                Create Account
              </StyledText>
              <StyledText className="text-center text-gray-200 text-lg">
                Sign up to get started
              </StyledText>
            </StyledView>
            
            <StyledView className="space-y-4">
              <StyledView>
                <StyledTextInput
                  className="bg-white/20 p-4 rounded-xl text-white text-lg border border-white/30"
                  placeholder="Email"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </StyledView>
              
              <StyledView>
                <StyledTextInput
                  className="bg-white/20 p-4 rounded-xl text-white text-lg border border-white/30"
                  placeholder="Password"
                  placeholderTextColor="#CBD5E1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </StyledView>
            </StyledView>

            <StyledTouchableOpacity
              className={`p-4 rounded-xl ${
                loading 
                  ? 'bg-white/30' 
                  : 'bg-white'
              } shadow-lg transform transition-all duration-200`}
              onPress={handleRegister}
              disabled={loading}
            >
              <StyledText 
                className={`text-center font-bold text-lg ${
                  loading ? 'text-gray-200' : 'text-purple-600'
                }`}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </StyledText>
            </StyledTouchableOpacity>

            <StyledTouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="p-4"
            >
              <StyledText className="text-center text-white text-lg">
                Already have an account? <StyledText className="font-bold">Sign in</StyledText>
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
} 