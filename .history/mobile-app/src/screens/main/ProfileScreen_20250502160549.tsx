import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import PostCard from '../../components/PostCard';

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
  user_id: string;
  date_id: string;
  description: string;
  created_at: string;
  date: {
    date_time: string;
    location: string;
  };
  likes: Array<{ count: number }>;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
  }>;
};

type RootStackParamList = {
  Profile: { userId?: string };
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation();
  const { userId } = route.params || {};
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen mounted, fetching data...');
    fetchProfile();
    fetchPosts();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in fetchProfile');
        return;
      }

      console.log('Current user:', user.id);
      const targetUserId = userId || user.id;
      console.log('Fetching profile for user:', targetUserId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      console.log('Profile data:', data);
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found in fetchPosts');
        return;
      }

      const targetUserId = userId || user.id;
      console.log('Fetching posts for user:', targetUserId);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          description,
          created_at,
          date_id,
          date:dates(
            datetime,
            location
          ),
          likes:post_likes(count),
          comments:post_comments(
            id,
            content,
            created_at
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw posts data:', data);
      
      // Transform the data to match our Post type
      const transformedPosts = data?.map(post => ({
        ...post,
        date: {
          date_time: post.date[0]?.datetime || '',
          location: post.date[0]?.location || ''
        }
      })) || [];

      console.log('Transformed posts:', transformedPosts);
      setPosts(transformedPosts);
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
                    className="w-24 h-24 rounded-full"
                  />
                ) : (
                  <Ionicons name="person" size={40} color="#818CF8" />
                )}
              </StyledView>
              {isOwnProfile && (
                <StyledTouchableOpacity
                  onPress={pickImage}
                  className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-2"
                >
                  <Ionicons name="camera" size={16} color="white" />
                </StyledTouchableOpacity>
              )}
            </StyledView>

            {isEditing ? (
              <StyledView className="w-full mt-4">
                <StyledTextInput
                  className="bg-[#1C2438] text-white px-4 py-2 rounded-lg mb-2 font-sora-regular"
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="Full Name"
                  placeholderTextColor="#6B7280"
                />
                <StyledTextInput
                  className="bg-[#1C2438] text-white px-4 py-2 rounded-lg mb-4 font-sora-regular"
                  value={editedProfile.username}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, username: text }))}
                  placeholder="Username"
                  placeholderTextColor="#6B7280"
                />
                <StyledView className="flex-row justify-center space-x-4">
                  <StyledTouchableOpacity
                    onPress={handleSaveProfile}
                    className="bg-indigo-500 px-6 py-2 rounded-lg"
                  >
                    <StyledText className="text-white font-sora-medium">Save</StyledText>
                  </StyledTouchableOpacity>
                  <StyledTouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setEditedProfile(profile || {});
                    }}
                    className="bg-gray-600 px-6 py-2 rounded-lg"
                  >
                    <StyledText className="text-white font-sora-medium">Cancel</StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            ) : (
              <StyledView className="items-center mt-4">
                <StyledText className="text-white text-xl font-sora-semibold">
                  {profile?.full_name}
                </StyledText>
                <StyledText className="text-gray-400 font-sora-regular">
                  @{profile?.username}
                </StyledText>
                {isOwnProfile && (
                  <StyledTouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="mt-4 bg-indigo-500 px-6 py-2 rounded-lg"
                  >
                    <StyledText className="text-white font-sora-medium">Edit Profile</StyledText>
                  </StyledTouchableOpacity>
                )}
              </StyledView>
            )}
          </StyledView>
        </StyledView>

        <StyledView className="px-4">
          <StyledText className="text-white text-lg font-sora-semibold mb-4">
            Posts
          </StyledText>
          {posts.length === 0 ? (
            <StyledView className="items-center py-8">
              <StyledText className="text-gray-400 font-sora-regular">
                No posts yet
              </StyledText>
            </StyledView>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                displayName={profile?.full_name || ''}
                username={profile?.username || ''}
                timestamp={new Date(post.created_at).toLocaleDateString()}
                location={post.date?.location || ''}
                likes={post.likes?.[0]?.count || 0}
                comments={post.comments?.length || 0}
                avatarUrl={profile?.avatar_url || undefined}
                onLike={() => {
                  console.log('Like post:', post.id);
                  // TODO: Implement like functionality
                }}
                onComment={() => {
                  console.log('Comment on post:', post.id);
                  // TODO: Implement comment functionality
                }}
              />
            ))
          )}
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 