import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { useRoute, useNavigation } from '@react-navigation/native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender: {
    username: string;
    avatar_url: string | null;
  };
};

type ChatScreenParams = {
  friend: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
};

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { friend } = route.params as ChatScreenParams;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    navigation.setOptions({
      title: friend.username,
    });

    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      supabase.channel('messages').unsubscribe();
    };
  }, [friend.id]);

  const setupRealtimeSubscription = () => {
    const { data: { user } } = supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${friend.id},receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchMessages();
          }
        }
      )
      .subscribe();
  };

  const fetchMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${friend.id},receiver_id.eq.${friend.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark messages as read
      const unreadMessages = data.filter(
        (msg) => msg.receiver_id === user.id && !msg.is_read
      );

      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in(
            'id',
            unreadMessages.map((msg) => msg.id)
          );
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: friend.id,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
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
      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledScrollView
          ref={scrollViewRef}
          className="flex-1"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <StyledView className="p-4 space-y-4">
            {messages.map((message) => {
              const isMe = message.sender_id === friend.id;
              return (
                <StyledView
                  key={message.id}
                  className={`flex-row ${isMe ? 'justify-start' : 'justify-end'}`}
                >
                  <StyledView
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      isMe ? 'bg-[#1C2438]' : 'bg-indigo-500'
                    }`}
                  >
                    <StyledText className="text-white">
                      {message.content}
                    </StyledText>
                    <StyledText className="text-gray-400 text-xs mt-1">
                      {formatTime(message.created_at)}
                    </StyledText>
                  </StyledView>
                </StyledView>
              );
            })}
          </StyledView>
        </StyledScrollView>

        <StyledView className="p-4 border-t border-[#1C2438]">
          <StyledView className="flex-row space-x-2">
            <StyledTextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#6B7280"
              className="flex-1 bg-[#1C2438] text-white rounded-full px-4 py-2"
              multiline
            />
            <StyledTouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() ? 'bg-indigo-500' : 'bg-[#1C2438]'
              }`}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? 'white' : '#6B7280'}
              />
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
} 