import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
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
  user: {
    username: string;
    avatar_url: string | null;
  };
  date: {
    datetime: string;
    location: string;
  };
  likes: number;
  is_liked: boolean;
  comments: Comment[];
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  };
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
  const [refreshing, setRefreshing] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useFocusEffect(
    React.useCallback(() => {
      console.log('Profile screen focused, fetching data...');
      const fetchData = async () => {
        setLoading(true);
        try {
          await Promise.all([fetchProfile(), fetchPosts()]);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, [])
  );

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
          *,
          user:profiles!fk_posts_user_id(username, avatar_url),
          date:dates(datetime, location),
          likes(count),
          comments:comments!comments_post_id_fkey(
            *,
            user:profiles!fk_comments_user_id(username, avatar_url)
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Check if current user liked each post
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);

      const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

      const processedPosts = data.map(post => ({
        ...post,
        likes: post.likes[0]?.count || 0,
        is_liked: likedPostIds.has(post.id),
        comments: post.comments || []
      }));

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId: string, comment: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!comment?.trim()) return;

      await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: comment.trim()
        });

      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProfile(), fetchPosts()]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <StyledSafeAreaView className="flex-1 bg-[#0A0F1C] items-center justify-center">
        <StyledText className="text-white">Loading...</StyledText>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#818CF8"
          />
        }
      >
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
              <StyledView
                key={post.id}
                className="bg-[#1E293B] rounded-2xl p-5 mb-4 shadow-lg"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5
                }}
              >
                {/* User Header */}
                <StyledView className="flex-row items-center mb-4">
                  <StyledView 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      borderWidth: 2,
                      borderColor: '#6366F1'
                    }}
                  >
                    {post?.user?.avatar_url ? (
                      <StyledImage
                        source={{ uri: post.user.avatar_url }}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#6366F1" />
                    )}
                  </StyledView>
                  <StyledView className="flex-1 ml-3">
                    <StyledText className="text-white sora-semibold text-base">
                      {post.user?.username}
                    </StyledText>
                    <StyledText className="text-[#94A3B8] text-xs">
                      {new Date(post.created_at).toLocaleString()}
                    </StyledText>
                  </StyledView>
                </StyledView>

                {/* Date Info */}
                <StyledView className="bg-[#0F172A] rounded-xl p-4 mb-4">
                  <StyledView className="flex-row items-center mb-2">
                    <StyledView className="w-8 h-8 rounded-full bg-[#1E293B] items-center justify-center">
                      <Ionicons name="calendar" size={18} color="#6366F1" />
                    </StyledView>
                    <StyledText className="text-white ml-3 flex-1 sora-medium">
                      {new Date(post.date?.datetime).toLocaleDateString()}
                    </StyledText>
                  </StyledView>
                  <StyledView className="flex-row items-center">
                    <StyledView className="w-8 h-8 rounded-full bg-[#1E293B] items-center justify-center">
                      <Ionicons name="location" size={18} color="#6366F1" />
                    </StyledView>
                    <StyledText className="text-white ml-3 flex-1 sora-medium">
                      {post.date?.location}
                    </StyledText>
                  </StyledView>
                </StyledView>

                {/* Description */}
                <StyledText className="text-[#E2E8F0] text-base font-sora-medium mb-4 leading-6">
                  {post?.description}
                </StyledText>

                {/* Actions */}
                <StyledView className="flex-row space-x-4">
                  <StyledTouchableOpacity
                    onPress={() => toggleLike(post?.id, post?.is_liked)}
                    className="flex-row items-center bg-[#0F172A] px-4 py-2 rounded-full"
                  >
                    <Ionicons
                      name={post.is_liked ? "heart" : "heart-outline"}
                      size={20}
                      color={post.is_liked ? "#F43F5E" : "#94A3B8"}
                    />
                    <StyledText className={`ml-2 sora-medium ${post.is_liked ? 'text-[#F43F5E]' : 'text-[#94A3B8]'}`}>
                      {post.likes}
                    </StyledText>
                  </StyledTouchableOpacity>

                  <StyledTouchableOpacity
                    onPress={() => toggleComments(post.id)}
                    className="flex-row items-center bg-[#0F172A] px-4 py-2 rounded-full"
                  >
                    <Ionicons name="chatbubble-outline" size={18} color="#94A3B8" />
                    <StyledText className="text-[#94A3B8] ml-2 sora-medium">
                      {post.comments.length}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <StyledView className="mt-4 pt-4 border-t border-[#1E293B]">
                    {post?.comments?.map((comment) => (
                      <StyledView
                        key={comment.id}
                        className="bg-[#0F172A] rounded-xl p-4 mb-2"
                      >
                        <StyledView className="flex-row items-center mb-2">
                          <StyledView 
                            className="w-8 h-8 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              borderWidth: 1.5,
                              borderColor: '#6366F1'
                            }}
                          >
                            {comment?.user?.avatar_url ? (
                              <StyledImage
                                source={{ uri: comment.user.avatar_url }}
                                className="w-full h-full rounded-full"
                              />
                            ) : (
                              <Ionicons name="person" size={16} color="#6366F1" />
                            )}
                          </StyledView>
                          <StyledText className="text-white sora-medium ml-3">
                            {comment.user.username}
                          </StyledText>
                        </StyledView>
                        <StyledText className="text-[#E2E8F0] ml-11">
                          {comment.content}
                        </StyledText>
                      </StyledView>
                    ))}

                    <StyledView className="flex-row items-center space-x-2 mt-2">
                      <StyledTextInput
                        value={commentInputs[post.id] || ''}
                        onChangeText={(text) =>
                          setCommentInputs(prev => ({ ...prev, [post.id]: text }))
                        }
                        placeholder="Add a comment..."
                        placeholderTextColor="#64748B"
                        className="flex-1 bg-[#0F172A] text-white rounded-full px-4 py-3"
                      />
                      <StyledTouchableOpacity
                        onPress={() => {
                          addComment(post.id, commentInputs[post.id] || '');
                          setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                        }}
                        disabled={!commentInputs[post.id]?.trim()}
                        className={`rounded-full w-10 h-10 items-center justify-center ${
                          commentInputs[post.id]?.trim() ? 'bg-[#6366F1]' : 'bg-[#0F172A]'
                        }`}
                        style={{
                          shadowColor: commentInputs[post.id]?.trim() ? '#6366F1' : 'transparent',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                          elevation: 5
                        }}
                      >
                        <Ionicons
                          name="send"
                          size={18}
                          color={commentInputs[post.id]?.trim() ? 'white' : '#64748B'}
                        />
                      </StyledTouchableOpacity>
                    </StyledView>
                  </StyledView>
                )}
              </StyledView>
            ))
          )}
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 