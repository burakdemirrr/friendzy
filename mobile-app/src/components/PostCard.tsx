import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledGradient = styled(LinearGradient);

interface PostCardProps {
  username?: string;
  timestamp: string;
  location?: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  avatarUrl?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  username = 'User',
  timestamp,
  location,
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  avatarUrl = 'https://via.placeholder.com/40',
}) => {
  return (
    <StyledView className="mx-4 my-2 overflow-hidden">
      {/* Card with subtle gradient background */}
      <StyledGradient
        colors={['#ffffff', '#f8fafc']}
        className="rounded-3xl p-4 border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Header with avatar and username */}
        <StyledView className="flex-row items-center mb-4">
          <StyledView className="mr-3">
            <StyledImage
              source={{ uri: avatarUrl }}
              className="w-12 h-12 rounded-full border-2 border-white"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            />
          </StyledView>
          <StyledView className="flex-1">
            <StyledText className="text-base font-bold text-gray-800">{username}</StyledText>
            <StyledText className="text-xs text-gray-500 mt-0.5">{timestamp}</StyledText>
          </StyledView>
          <StyledTouchableOpacity 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#64748B" />
          </StyledTouchableOpacity>
        </StyledView>

        {/* Content Section */}
        <StyledView className="space-y-3">
          {/* Date indicator with modern badge style */}
          <StyledView className="flex-row items-center">
            <StyledView className="flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-full">
              <Ionicons name="calendar-outline" size={16} color="#6366F1" />
              <StyledText className="text-xs font-medium text-indigo-600 ml-1.5">
                Invalid Date
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Location with modern badge style */}
          {location && (
            <StyledView className="flex-row items-center">
              <StyledView className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full">
                <Ionicons name="location-outline" size={16} color="#3B82F6" />
                <StyledText className="text-xs font-medium text-blue-600 ml-1.5">
                  {location}
                </StyledText>
              </StyledView>
            </StyledView>
          )}
        </StyledView>

        {/* Interaction buttons with modern style */}
        <StyledView className="flex-row mt-6 pt-4 border-t border-gray-100">
          <StyledTouchableOpacity 
            className="flex-row items-center mr-6 bg-gray-50 px-4 py-2 rounded-full"
            onPress={onLike}
          >
            <Ionicons 
              name="heart-outline" 
              size={18} 
              color="#EC4899"
            />
            <StyledText className="text-sm font-medium text-gray-600 ml-2">
              {likes}
            </StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity 
            className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full"
            onPress={onComment}
          >
            <Ionicons 
              name="chatbubble-outline" 
              size={18} 
              color="#8B5CF6"
            />
            <StyledText className="text-sm font-medium text-gray-600 ml-2">
              {comments}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledGradient>
    </StyledView>
  );
}; 