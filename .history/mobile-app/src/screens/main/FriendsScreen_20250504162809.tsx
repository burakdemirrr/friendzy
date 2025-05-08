import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, Animated, Platform } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, shadows } from '../../styles/theme';

type RootStackParamList = {
  SendDate: { friend: User };
  Chat: { friend: { id: string; username: string; avatar_url: string | null } };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

type User = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
};

type FriendRequest = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const navigation = useNavigation<NavigationProp>();

  // Animation values
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const [itemAnims] = useState(() => new Map<string, Animated.Value>());

  useEffect(() => {
    animateMount();
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const animateMount = () => {
    Animated.parallel([
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateItemRemoval = (id: string) => {
    const anim = itemAnims.get(id) || new Animated.Value(1);
    itemAnims.set(id, anim);

    return new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  };

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select('*, friend:profiles!friends_friend_id_fkey(*)')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    setFriends(data.map(f => f.friend) || []);
  };

  const fetchFriendRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (error) {
      console.error('Error fetching friend requests:', error);
      return;
    }

    setFriendRequests(data || []);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Filter out the current user
      const { data: { user } } = await supabase.auth.getUser();
      const filteredUsers = data?.filter(u => u.id !== user?.id) || [];
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;

      // Update friend requests list
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const isFriendRequestSent = async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    return friendRequests.some(
      request => 
        (request.user_id === user.id && request.friend_id === userId) ||
        (request.friend_id === user.id && request.user_id === userId)
    );
  };

  const handleSendDateInvitation = (friend: User) => {
    navigation.navigate('SendDate', { friend });
  };

  const handleFriendPress = (friend: User) => {
    navigation.navigate('Chat', { friend });
  };

  const handleRemoveFriend = async (friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await animateItemRemoval(friendId);

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);

      if (error) throw error;
      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    await animateItemRemoval(requestId);

    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    await animateItemRemoval(requestId);

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const AnimatedStyledView = Animated.createAnimatedComponent(StyledView);

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <AnimatedStyledView 
        className="px-6 pt-2 pb-4"
        style={{
          opacity: searchBarAnim,
          transform: [{ translateY: searchBarAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 0]
          })}]
        }}
      >
        <StyledText 
          className="text-[28px] font-bold mb-4"
          style={{ 
            color: colors.text.primary,
            letterSpacing: typography.h2.letterSpacing
          }}
        >
          Friends
        </StyledText>

        {/* Search Bar */}
        <StyledView 
          className="flex-row items-center rounded-xl px-4 py-3"
          style={{ 
            backgroundColor: colors.background.secondary,
            ...shadows.sm
          }}
        >
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <StyledTextInput
            className="flex-1 ml-2 text-base"
            style={{ 
              color: colors.text.primary,
              fontSize: typography.body.fontSize,
              letterSpacing: typography.body.letterSpacing
            }}
            placeholder="Search friends"
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchUsers}
          />
          {searchQuery.length > 0 && (
            <StyledTouchableOpacity 
              onPress={() => setSearchQuery('')}
              className="p-1"
            >
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </StyledTouchableOpacity>
          )}
        </StyledView>
      </AnimatedStyledView>

      <StyledScrollView className="flex-1 px-6">
        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <AnimatedStyledView
            className="mb-6"
            style={{
              opacity: listAnim,
              transform: [{ translateY: listAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })}]
            }}
          >
            <StyledText 
              className="text-base font-semibold mb-3"
              style={{ 
                color: colors.text.secondary,
                letterSpacing: typography.body.letterSpacing
              }}
            >
              Friend Requests
            </StyledText>
            <StyledView className="space-y-3">
              {friendRequests.map((request) => {
                const itemAnim = itemAnims.get(request.id) || new Animated.Value(1);
                return (
                  <AnimatedStyledView
                    key={request.id}
                    className="bg-white rounded-xl p-4"
                    style={{
                      ...shadows.sm,
                      opacity: itemAnim,
                      transform: [{ scale: itemAnim }]
                    }}
                  >
                    <StyledView className="flex-row items-center">
                      <StyledView 
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${colors.primary}10` }}
                      >
                        {request.user?.avatar_url ? (
                          <StyledImage
                            source={{ uri: request.user.avatar_url }}
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <Ionicons name="person" size={24} color={colors.primary} />
                        )}
                      </StyledView>
                      <StyledView className="flex-1">
                        <StyledText 
                          className="font-semibold"
                          style={{ 
                            color: colors.text.primary,
                            fontSize: typography.body.fontSize,
                            letterSpacing: typography.body.letterSpacing
                          }}
                        >
                          {request.user?.username}
                        </StyledText>
                      </StyledView>
                      <StyledView className="flex-row space-x-2">
                        <StyledTouchableOpacity
                          onPress={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 rounded-xl"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <StyledText 
                            className="font-medium"
                            style={{ color: colors.text.white }}
                          >
                            Accept
                          </StyledText>
                        </StyledTouchableOpacity>
                        <StyledTouchableOpacity
                          onPress={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 rounded-xl"
                          style={{ backgroundColor: colors.background.secondary }}
                        >
                          <StyledText 
                            className="font-medium"
                            style={{ color: colors.text.secondary }}
                          >
                            Decline
                          </StyledText>
                        </StyledTouchableOpacity>
                      </StyledView>
                    </StyledView>
                  </AnimatedStyledView>
                );
              })}
            </StyledView>
          </AnimatedStyledView>
        )}

        {/* Friends List */}
        <AnimatedStyledView
          style={{
            opacity: listAnim,
            transform: [{ translateY: listAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}]
          }}
        >
          <StyledText 
            className="text-base font-semibold mb-3"
            style={{ 
              color: colors.text.secondary,
              letterSpacing: typography.body.letterSpacing
            }}
          >
            Your Friends
          </StyledText>
          <StyledView className="space-y-3">
            {friends.map((friend) => {
              const itemAnim = itemAnims.get(friend.id) || new Animated.Value(1);
              return (
                <AnimatedStyledView
                  key={friend.id}
                  className="bg-white rounded-xl p-4"
                  style={{
                    ...shadows.sm,
                    opacity: itemAnim,
                    transform: [{ scale: itemAnim }]
                  }}
                >
                  <StyledView className="flex-row items-center">
                    <StyledView 
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${colors.primary}10` }}
                    >
                      {friend.avatar_url ? (
                        <StyledImage
                          source={{ uri: friend.avatar_url }}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <Ionicons name="person" size={24} color={colors.primary} />
                      )}
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText 
                        className="font-semibold"
                        style={{ 
                          color: colors.text.primary,
                          fontSize: typography.body.fontSize,
                          letterSpacing: typography.body.letterSpacing
                        }}
                      >
                        {friend.username}
                      </StyledText>
                    </StyledView>
                    <StyledView className="flex-row space-x-2">
                      <StyledTouchableOpacity
                        onPress={() => navigation.navigate('Chat', { friend })}
                        className="px-4 py-2 rounded-xl"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <StyledText 
                          className="font-medium"
                          style={{ color: colors.text.white }}
                        >
                          Message
                        </StyledText>
                      </StyledTouchableOpacity>
                      <StyledTouchableOpacity
                        onPress={() => handleRemoveFriend(friend.id)}
                        className="px-4 py-2 rounded-xl"
                        style={{ backgroundColor: colors.background.secondary }}
                      >
                        <StyledText 
                          className="font-medium"
                          style={{ color: colors.text.secondary }}
                        >
                          Remove
                        </StyledText>
                      </StyledTouchableOpacity>
                    </StyledView>
                  </StyledView>
                </AnimatedStyledView>
              );
            })}
          </StyledView>
        </AnimatedStyledView>

        {/* Loading State */}
        {loading && (
          <StyledView className="py-4">
            <ActivityIndicator size="large" color={colors.primary} />
          </StyledView>
        )}

        {/* Empty States */}
        {!loading && friends.length === 0 && (
          <StyledView className="py-8 items-center">
            <StyledView 
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Ionicons name="people" size={32} color={colors.primary} />
            </StyledView>
            <StyledText 
              className="text-center text-base"
              style={{ 
                color: colors.text.secondary,
                letterSpacing: typography.body.letterSpacing
              }}
            >
              No friends yet.{'\n'}Search for users to add as friends.
            </StyledText>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 