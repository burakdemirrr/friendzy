import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { styled } from 'nativewind';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);
const StyledLinearGradient = styled(LinearGradient);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProfileImage(result.assets[0].base64);
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName || !username) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      let profileImageUrl = null;
      
      if (profileImage) {
        const fileName = `${user.id}-${Date.now()}.jpg`;
        const { error: uploadError, data } = await supabase.storage
          .from('profile-images')
          .upload(fileName, decode(profileImage), {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
          
        profileImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          bio: fullName,
          username,
          avatar_url: profileImageUrl,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StatusBar barStyle="light-content" />
      <StyledKeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledScrollView className="flex-1">
          <StyledView className="px-6 pt-8 pb-6">
            <StyledView className="mb-6">
              <StyledView className="h-14 w-14 bg-indigo-500/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="person" size={28} color="#818CF8" />
              </StyledView>
              <StyledText className="text-4xl font-bold text-white mb-2 tracking-tight">
                Complete Your Profile
              </StyledText>
              <StyledText className="text-gray-400 text-base">
                Let's get to know you better
              </StyledText>
            </StyledView>

            <StyledView className="space-y-6">
              {/* Profile Image Picker */}
              <StyledView className="items-center">
                <StyledTouchableOpacity
                  onPress={pickImage}
                  className="w-32 h-32 rounded-full bg-[#1C2438] items-center justify-center overflow-hidden border-2 border-indigo-500/20"
                >
                  {profileImage ? (
                    <StyledImage
                      source={{ uri: `data:image/jpeg;base64,${profileImage}` }}
                      className="w-full h-full"
                    />
                  ) : (
                    <StyledView className="items-center">
                      <Ionicons name="camera" size={32} color="#6B7280" />
                      <StyledText className="text-gray-400 mt-2">Add Photo</StyledText>
                    </StyledView>
                  )}
                </StyledTouchableOpacity>
              </StyledView>

              {/* Full Name Input */}
              <StyledView>
                <StyledText className="text-gray-300 text-sm font-medium mb-2 ml-1">
                  Full Name
                </StyledText>
                <StyledView className="bg-[#1C2438] rounded-xl flex-row items-center px-4">
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                  <StyledTextInput
                    className="flex-1 py-3.5 px-3 text-white text-base"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#6B7280"
                  />
                </StyledView>
              </StyledView>

              {/* Username Input */}
              <StyledView>
                <StyledText className="text-gray-300 text-sm font-medium mb-2 ml-1">
                  Username
                </StyledText>
                <StyledView className="bg-[#1C2438] rounded-xl flex-row items-center px-4">
                  <Ionicons name="at" size={20} color="#6B7280" />
                  <StyledTextInput
                    className="flex-1 py-3.5 px-3 text-white text-base"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Choose a username"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="none"
                  />
                </StyledView>
              </StyledView>

              {/* Save Button */}
              <StyledTouchableOpacity
                className="mt-6"
                onPress={handleSaveProfile}
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
                      {loading ? 'Saving...' : 'Complete Profile'}
                    </StyledText>
                  </StyledView>
                </StyledLinearGradient>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
} 