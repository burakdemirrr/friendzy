import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import CreatePost from '../../components/CreatePost';

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
  const [refreshing, setRefreshing] = useState(false);
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
        user:profiles!fk_posts_user_id(username, avatar_url),
        date:dates(datetime, location),
        likes(count),
         comments:comments!comments_post_id_fkey(
    *,
    user:profiles!fk_comments_user_id(username, avatar_url)
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPosts();
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
    <StyledSafeAreaView className="flex-1 bg-[#0F172A]">
      <StyledView className="px-6 py-4 border-b border-[#1E293B] flex-row items-center justify-between">
        <StyledText className="text-2xl font-sora-bold text-white" >
          Friendzy
        </StyledText>
        <StyledView className="w-10 h-10 rounded-full bg-[#1E293B] items-center justify-center">
          <Ionicons name="notifications-outline" size={22} color="#94A3B8" />
        </StyledView>
      </StyledView>
      
      <StyledScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#818CF8"
          />
        }
      >
        <StyledView className="px-4 pt-4">
          <CreatePost onPostCreated={fetchPosts} />
        </StyledView>

        {posts.length === 0 ? (
          <StyledView className="flex-1 items-center justify-center py-20">
            <Ionicons name="newspaper-outline" size={48} color="#94A3B8" />
            <StyledText className="text-[#94A3B8] text-lg mt-4 font-sora-medium">
              No posts yet
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="px-4">
            {posts.map((post) => (
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
                      {new Date(post.date?.date_time).toLocaleDateString()}
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
                <StyledView className="flex-row items-center justify-between border-t border-[#334155] pt-4">
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
                  <StyledView className="mt-4 pt-4">
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

                    <StyledView className="flex-row items-center mt-3 space-x-2">
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
                        onPress={() => addComment(post.id)}
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
            ))}
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 