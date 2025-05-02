import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface PostCardProps {
  username?: string;
  timestamp: string;
  location?: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  username = 'User',
  timestamp,
  location,
  likes = 0,
  comments = 0,
  onLike,
  onComment,
}) => {
  return (
    <StyledView className="bg-white rounded-2xl p-4 mx-4 my-2 shadow-md">
      {/* Header with avatar and username */}
      <StyledView className="flex-row items-center mb-3">
        <StyledView className="mr-3">
          <StyledImage
            source={{ uri: 'https://via.placeholder.com/40' }}
            className="w-10 h-10 rounded-full"
          />
        </StyledView>
        <StyledView className="flex-1">
          <StyledText className="text-base font-semibold text-gray-800">{username}</StyledText>
        </StyledView>
        <StyledTouchableOpacity className="p-1">
          <Ionicons name="notifications-outline" size={24} color="#64748B" />
        </StyledTouchableOpacity>
      </StyledView>

      {/* Timestamp */}
      <StyledText className="text-sm text-gray-500 mb-2">{timestamp}</StyledText>

      {/* Date indicator */}
      <StyledView className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={20} color="#64748B" />
        <StyledText className="text-sm text-gray-500 ml-2">Invalid Date</StyledText>
      </StyledView>

      {/* Location */}
      {location && (
        <StyledView className="flex-row items-center mb-3">
          <Ionicons name="location-outline" size={20} color="#64748B" />
          <StyledText className="text-sm text-gray-500 ml-2">{location}</StyledText>
        </StyledView>
      )}

      {/* Interaction buttons */}
      <StyledView className="flex-row mt-3">
        <StyledTouchableOpacity className="flex-row items-center mr-5" onPress={onLike}>
          <Ionicons name="heart-outline" size={24} color="#64748B" />
          <StyledText className="text-sm text-gray-500 ml-1">{likes}</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity className="flex-row items-center" onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={24} color="#64748B" />
          <StyledText className="text-sm text-gray-500 ml-1">{comments}</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
}; 