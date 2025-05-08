import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [postDate, setPostDate] = useState(new Date());
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please write something to post');
      return;
    }

    const now = new Date();
    now.setSeconds(0, 0);
    const selectedPostDate = new Date(postDate);
    selectedPostDate.setSeconds(0,0);

    if (selectedPostDate < now) {
      Alert.alert('Error', 'Please choose a current or future date and time for your post');
      return;
    }

    setIsPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to post');
        return;
      }

      const { data: dateData, error: dateError } = await supabase
        .from('dates')
        .insert({
          datetime: postDate.toISOString(),
          location: location.trim() || null,
          sender_id: user.id,
        })
        .select()
        .single();

      if (dateError) throw dateError;

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          description: description.trim(),
          date_id: dateData.id,
        });

      if (postError) throw postError;

      setDescription('');
      setLocation('');
      setPostDate(new Date());
      onPostCreated();
      
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  // Format the date for the datetime-local input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setPostDate(newDate);
  };

  return (
    <StyledView className="bg-[#1E293B] p-4 mb-4 rounded-xl">
      <StyledTextInput
        className="bg-[#0F172A] text-white p-4 rounded-xl mb-3 min-h-[80px] font-sora-regular"
        placeholder="What's on your mind?"
        placeholderTextColor="#64748B"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      
      <StyledView className="flex-row items-center mb-3">
        <Ionicons name="location-outline" size={20} color="#64748B" />
        <StyledTextInput
          className="flex-1 bg-[#0F172A] text-white px-3 py-2.5 rounded-xl ml-2 font-sora-regular"
          placeholder="Add location (optional)"
          placeholderTextColor="#64748B"
          value={location}
          onChangeText={setLocation}
        />
      </StyledView>

      <StyledView className="mb-3">
        <input
          type="datetime-local"
          value={formatDateForInput(postDate)}
          onChange={handleDateTimeChange}
          min={formatDateForInput(new Date())}
          className="w-full bg-[#0F172A] text-white px-3 py-2.5 rounded-xl font-sora-regular"
          style={{
            colorScheme: 'dark',
            border: 'none',
            outline: 'none'
          }}
        />
      </StyledView>

      <StyledTouchableOpacity
        onPress={handlePost}
        disabled={isPosting}
        className={`bg-indigo-500 p-3 rounded-xl ${isPosting ? 'opacity-50' : ''}`}
      >
        <StyledText className="text-white text-center font-sora-medium">
          {isPosting ? 'Posting...' : 'Post'}
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
} 