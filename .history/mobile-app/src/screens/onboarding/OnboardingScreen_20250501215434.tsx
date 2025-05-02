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
} from 'react-native';
import { styled } from 'nativewind';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { decode } from 'base64-arraybuffer';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledScrollView = styled(ScrollView);

export default function OnboardingScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          full_name: fullName,
          username,
          birth_date: birthDate.toISOString(),
          avatar_url: profileImageUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully!');
      
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledScrollView className="flex-1 bg-white">
      <StyledView className="flex-1 px-6 py-12">
        <StyledText className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Profile
        </StyledText>
        <StyledText className="text-gray-600 text-base mb-8">
          Let's get to know you better
        </StyledText>

        <StyledView className="space-y-6">
          {/* Profile Image Picker */}
          <StyledView className="items-center">
            <StyledTouchableOpacity
              onPress={pickImage}
              className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center overflow-hidden"
            >
              {profileImage ? (
                <StyledImage
                  source={{ uri: `data:image/jpeg;base64,${profileImage}` }}
                  className="w-full h-full"
                />
              ) : (
                <StyledText className="text-gray-500">Add Photo</StyledText>
              )}
            </StyledTouchableOpacity>
          </StyledView>

          {/* Full Name Input */}
          <StyledView>
            <StyledText className="text-gray-700 mb-2 text-base">
              Full Name
            </StyledText>
            <StyledTextInput
              className="w-full bg-gray-100 p-4 rounded-lg text-gray-900"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
            />
          </StyledView>

          {/* Username Input */}
          <StyledView>
            <StyledText className="text-gray-700 mb-2 text-base">
              Username
            </StyledText>
            <StyledTextInput
              className="w-full bg-gray-100 p-4 rounded-lg text-gray-900"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </StyledView>

          {/* Birth Date Picker */}
          <StyledView>
            <StyledText className="text-gray-700 mb-2 text-base">
              Birth Date
            </StyledText>
            <StyledTouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="w-full bg-gray-100 p-4 rounded-lg"
            >
              <StyledText className="text-gray-900">
                {birthDate.toLocaleDateString()}
              </StyledText>
            </StyledTouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setBirthDate(selectedDate);
                  }
                }}
              />
            )}
          </StyledView>

          {/* Save Button */}
          <StyledTouchableOpacity
            className={`p-4 rounded-lg ${
              loading ? 'bg-blue-400' : 'bg-blue-500'
            }`}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <StyledText className="text-white text-center font-semibold text-lg">
              {loading ? 'Saving...' : 'Complete Profile'}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
} 