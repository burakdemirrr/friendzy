import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);

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
  likes: number;
  comments: Comment[];
  is_liked: boolean;
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

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPosts();
    const postsSubscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
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
          likes:likes(count),
          comments:comments!comments_post_id_fkey(
            *,
            user:profiles!comments_user_id_fkey(username, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if current user liked each post
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);

      const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

      const processedPosts = data.map(post => ({
        ...post,
        likes: post.likes[0].count,
        is_liked: likedPostIds.has(post.id),
        comments: post.comments || []
      }));

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
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

  const addComment = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const comment = commentInputs[postId];
      if (!comment?.trim()) return;

      await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: comment.trim()
        });

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
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
        {posts.length === 0 ? (
          <StyledView className="py-4 px-6">
            <StyledText className="text-gray-400 text-center">
              No posts yet
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="space-y-4 p-4">
            {posts.map((post) => (
              <StyledView
                key={post.id}
                className="bg-[#1C2438] rounded-xl p-4"
              >
                <StyledView className="flex-row items-center mb-4">
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
                      {new Date(post.created_at).toLocaleString()}
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledView className="space-y-2 mb-4">
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

                <StyledText className="text-white mb-4">
                  {post.description}
                </StyledText>

                <StyledView className="flex-row items-center space-x-4 mb-4">
                  <StyledTouchableOpacity
                    onPress={() => toggleLike(post.id, post.is_liked)}
                    className="flex-row items-center"
                  >
                    <Ionicons
                      name={post.is_liked ? "heart" : "heart-outline"}
                      size={24}
                      color={post.is_liked ? "#EF4444" : "#818CF8"}
                    />
                    <StyledText className="text-white ml-2">
                      {post.likes}
                    </StyledText>
                  </StyledTouchableOpacity>

                  <StyledTouchableOpacity
                    onPress={() => toggleComments(post.id)}
                    className="flex-row items-center"
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={24}
                      color="#818CF8"
                    />
                    <StyledText className="text-white ml-2">
                      {post.comments.length}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>

                {expandedComments.has(post.id) && (
                  <StyledView className="space-y-4">
                    <StyledView className="space-y-2">
                      {post.comments.map((comment) => (
                        <StyledView
                          key={comment.id}
                          className="bg-[#2D3748] rounded-lg p-3"
                        >
                          <StyledView className="flex-row items-center mb-2">
                            <StyledView className="w-8 h-8 rounded-full bg-indigo-500/20 items-center justify-center mr-2">
                              {comment.user.avatar_url ? (
                                <StyledImage
                                  source={{ uri: comment.user.avatar_url }}
                                  className="w-full h-full rounded-full"
                                />
                              ) : (
                                <Ionicons name="person" size={16} color="#818CF8" />
                              )}
                            </StyledView>
                            <StyledText className="text-white font-medium">
                              {comment.user.username}
                            </StyledText>
                          </StyledView>
                          <StyledText className="text-white">
                            {comment.content}
                          </StyledText>
                        </StyledView>
                      ))}
                    </StyledView>

                    <StyledView className="flex-row space-x-2">
                      <StyledTextInput
                        value={commentInputs[post.id] || ''}
                        onChangeText={(text) =>
                          setCommentInputs(prev => ({ ...prev, [post.id]: text }))
                        }
                        placeholder="Add a comment..."
                        placeholderTextColor="#6B7280"
                        className="flex-1 bg-[#2D3748] text-white rounded-lg px-4 py-2"
                      />
                      <StyledTouchableOpacity
                        onPress={() => addComment(post.id)}
                        className="bg-indigo-500 rounded-lg px-4 py-2"
                      >
                        <StyledText className="text-white">Send</StyledText>
                      </StyledTouchableOpacity>
                    </StyledView>
                  </StyledView>
                )}
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 