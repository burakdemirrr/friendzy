import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchFriendRequests();
  }, []);

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

  const isFriendRequestSent = (userId: string) => {
    const { data: { user } } = supabase.auth.getUser();
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

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledView className="px-6 pt-4">
        <StyledText className="text-2xl font-bold text-white mb-4">
          Friends
        </StyledText>

        {/* Search Input */}
        <StyledView className="flex-row items-center bg-[#1C2438] rounded-xl px-4 py-2 mb-4">
          <Ionicons name="search" size={20} color="#6B7280" />
          <StyledTextInput
            className="flex-1 ml-2 text-white text-base"
            placeholder="Search by username"
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchUsers}
          />
          {searchQuery.length > 0 && (
            <StyledTouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </StyledTouchableOpacity>
          )}
        </StyledView>
      </StyledView>
      
      <StyledScrollView className="flex-1 px-6">
        {loading ? (
          <StyledView className="py-4">
            <ActivityIndicator size="large" color="#818CF8" />
          </StyledView>
        ) : users.length > 0 ? (
          <StyledView className="space-y-4">
            {users.map((user) => (
              <StyledTouchableOpacity
                key={user.id}
                onPress={() => handleFriendPress(user)}
                className="bg-[#1C2438] rounded-xl p-4"
              >
                <StyledView className="flex-row items-center">
                  <StyledView className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                    {user.avatar_url ? (
                      <StyledImage
                        source={{ uri: user.avatar_url }}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#818CF8" />
                    )}
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-white font-medium">
                      {user.full_name}
                    </StyledText>
                    <StyledText className="text-gray-400 text-xs">
                      @{user.username}
                    </StyledText>
                  </StyledView>
                  <Ionicons name="chevron-forward" size={20} color="#818CF8" />
                </StyledView>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        ) : searchQuery ? (
          <StyledView className="py-4">
            <StyledText className="text-gray-400 text-center">
              No users found
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="py-4">
            <StyledText className="text-gray-400 text-center">
              Search for users to add as friends
            </StyledText>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 