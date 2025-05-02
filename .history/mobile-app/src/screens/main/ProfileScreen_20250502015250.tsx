import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);

type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

type Post = {
  id: string;
  date_id: string;
  description: string;
  created_at: string;
  date: {
    date_time: string;
    location: string;
  };
};

type ProfileScreenParams = {
  userId?: string;
};

export default function ProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as ProfileScreenParams;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const targetUserId = userId || user.id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const targetUserId = userId || user.id;
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          date:dates!posts_date_id_fkey(date_time, location)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      setEditedProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          username: editedProfile.username,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const isOwnProfile = !userId;

  if (loading) {
    return (
      <StyledSafeAreaView className="flex-1 bg-[#0A0F1C] items-center justify-center">
        <StyledText className="text-white">Loading...</StyledText>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledScrollView className="flex-1">
        <StyledView className="p-6">
          <StyledView className="items-center mb-6">
            <StyledView className="relative">
              <StyledView className="w-24 h-24 rounded-full bg-indigo-500/20 items-center justify-center">
                {profile?.avatar_url ? (
                  <StyledImage
                    source={{ uri: profile.avatar_url }}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={48} color="#818CF8" />
                )}
              </StyledView>
              {isOwnProfile && !isEditing && (
                <StyledTouchableOpacity
                  onPress={pickImage}
                  className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-2"
                >
                  <Ionicons name="camera" size={20} color="white" />
                </StyledTouchableOpacity>
              )}
            </StyledView>

            {isEditing ? (
              <StyledView className="w-full mt-4 space-y-4">
                <StyledTextInput
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="Full Name"
                  placeholderTextColor="#6B7280"
                  className="bg-[#1C2438] text-white rounded-lg px-4 py-2"
                />
                <StyledTextInput
                  value={editedProfile.username}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, username: text }))}
                  placeholder="Username"
                  placeholderTextColor="#6B7280"
                  className="bg-[#1C2438] text-white rounded-lg px-4 py-2"
                />
                <StyledView className="flex-row space-x-2">
                  <StyledTouchableOpacity
                    onPress={() => setIsEditing(false)}
                    className="flex-1 bg-[#1C2438] rounded-lg px-4 py-2"
                  >
                    <StyledText className="text-white text-center">Cancel</StyledText>
                  </StyledTouchableOpacity>
                  <StyledTouchableOpacity
                    onPress={handleSaveProfile}
                    className="flex-1 bg-indigo-500 rounded-lg px-4 py-2"
                  >
                    <StyledText className="text-white text-center">Save</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="items-center mt-4">
                <StyledText className="text-white text-xl font-bold">
                  {profile?.full_name}
                </StyledText>
                <StyledText className="text-gray-400">
                  @{profile?.username}
                </StyledText>
                {isOwnProfile && (
                  <StyledTouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="mt-4 bg-indigo-500 rounded-lg px-4 py-2"
                  >
                    <StyledText className="text-white">Edit Profile</StyledText>
                  </StyledTouchableOpacity>
                )}
              </StyledView>
            )}
          </StyledView>

          <StyledView className="space-y-4">
            <StyledText className="text-white text-lg font-bold">
              Date Posts
            </StyledText>
            {posts.length === 0 ? (
              <StyledText className="text-gray-400 text-center">
                No posts yet
              </StyledText>
            ) : (
              <StyledView className="space-y-4">
                {posts.map((post) => (
                  <StyledView
                    key={post.id}
                    className="bg-[#1C2438] rounded-xl p-4"
                  >
                    <StyledView className="space-y-2">
                      <StyledView className="flex-row items-center">
                        <Ionicons name="calendar" size={20} color="#818CF8" />
                        <StyledText className="text-white ml-2">
                          {new Date(post.date.date_time).toLocaleDateString()}
                        </StyledText>
                      </StyledView>
                      <StyledView className="flex-row items-center">
                        <Ionicons name="location" size={20} color="#818CF8" />
                        <StyledText className="text-white ml-2">
                          {post.date.location}
                        </StyledText>
                      </StyledView>
                    </StyledView>
                    <StyledText className="text-white mt-2">
                      {post.description}
                    </StyledText>
                  </StyledView>
                ))}
              </StyledView>
            )}
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 