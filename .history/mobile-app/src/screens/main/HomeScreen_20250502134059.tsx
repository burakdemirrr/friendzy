import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledImage = styled(Image);

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
    date_time: string;
    location: string;
  };
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!posts_user_id_fkey(username, avatar_url),
          date:dates!posts_date_id_fkey(date_time, location),
          likes_count:likes(count),
          comments_count:comments(count),
          has_liked:likes!inner(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.has_liked) {
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

  const addComment = async (postId: string) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: user.id, content: comment });

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <StyledSafeAreaView className="flex-1 bg-[#0A0F1C] items-center justify-center">
        <ActivityIndicator size="large" color="#818CF8" />
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledScrollView className="flex-1">
        <StyledView className="px-4 py-6">
          <StyledText className="text-2xl font-bold text-white mb-6">
            Posts
          </StyledText>

          <StyledView className="space-y-6">
            {posts.length === 0 ? (
              <StyledView className="items-center py-8">
                <StyledText className="text-gray-400 text-lg">
                  No posts yet
                </StyledText>
              </StyledView>
            ) : (
              posts.map((post) => (
                <StyledView
                  key={post.id}
                  className="bg-[#1C2438] rounded-xl overflow-hidden"
                >
                  {/* User Info */}
                  <StyledView className="p-4 flex-row items-center border-b border-gray-700">
                    <StyledView className="w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                      {post.user.avatar_url ? (
                        <StyledImage
                          source={{ uri: post.user.avatar_url }}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <Ionicons name="person" size={20} color="#818CF8" />
                      )}
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-white font-medium">
                        {post.user.username}
                      </StyledText>
                      <StyledText className="text-gray-400 text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </StyledText>
                    </StyledView>
                  </StyledView>

                  {/* Date Info */}
                  <StyledView className="p-4 bg-[#151E32]">
                    <StyledView className="flex-row items-center mb-2">
                      <Ionicons name="calendar" size={16} color="#818CF8" />
                      <StyledText className="text-white ml-2">
                        {new Date(post.date.date_time).toLocaleDateString()}
                      </StyledText>
                    </StyledView>
                    <StyledView className="flex-row items-center">
                      <Ionicons name="location" size={16} color="#818CF8" />
                      <StyledText className="text-white ml-2">
                        {post.date.location}
                      </StyledText>
                    </StyledView>
                  </StyledView>

                  {/* Description */}
                  <StyledView className="p-4">
                    <StyledText className="text-white text-base">
                      {post.description}
                    </StyledText>
                  </StyledView>

                  {/* Actions */}
                  <StyledView className="flex-row items-center justify-between px-4 py-3 border-t border-gray-700">
                    <StyledTouchableOpacity
                      onPress={() => toggleLike(post.id)}
                      className="flex-row items-center"
                    >
                      <Ionicons
                        name={post.has_liked ? "heart" : "heart-outline"}
                        size={24}
                        color={post.has_liked ? "#EF4444" : "#818CF8"}
                      />
                      <StyledText className="text-white ml-2">
                        {post.likes_count || 0}
                      </StyledText>
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity
                      onPress={() => setExpandedComments(prev =>
                        prev.includes(post.id)
                          ? prev.filter(id => id !== post.id)
                          : [...prev, post.id]
                      )}
                      className="flex-row items-center"
                    >
                      <Ionicons name="chatbubble-outline" size={22} color="#818CF8" />
                      <StyledText className="text-white ml-2">
                        {post.comments_count || 0}
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>

                  {/* Comments Section */}
                  {expandedComments.includes(post.id) && (
                    <StyledView className="p-4 border-t border-gray-700">
                      <StyledView className="flex-row space-x-2 mb-4">
                        <StyledTextInput
                          className="flex-1 bg-[#151E32] text-white rounded-full px-4 py-2"
                          placeholder="Add a comment..."
                          placeholderTextColor="#6B7280"
                          value={commentInputs[post.id] || ''}
                          onChangeText={(text) =>
                            setCommentInputs(prev => ({ ...prev, [post.id]: text }))
                          }
                        />
                        <StyledTouchableOpacity
                          onPress={() => addComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className={`w-10 h-10 rounded-full items-center justify-center ${
                            commentInputs[post.id]?.trim() ? 'bg-indigo-500' : 'bg-[#151E32]'
                          }`}
                        >
                          <Ionicons
                            name="send"
                            size={18}
                            color={commentInputs[post.id]?.trim() ? 'white' : '#6B7280'}
                          />
                        </StyledTouchableOpacity>
                      </StyledView>
                    </StyledView>
                  )}
                </StyledView>
              ))
            )}
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 