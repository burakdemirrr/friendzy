import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledPressable = styled(Pressable);
const StyledTouchableOpacity = styled(TouchableOpacity);
const AnimatedPressable = Animated.createAnimatedComponent(StyledPressable);

interface PostCardProps {
  displayName: string;
  username: string;
  timestamp: string;
  location?: string;
  likes?: number;
  comments?: number;
  onLike?: () => void;
  onComment?: () => void;
  avatarUrl?: string;
}

export default function PostCard({
  displayName,
  username,
  timestamp,
  location,
  likes = 0,
  comments = 0,
  onLike,
  onComment,
  avatarUrl,
}: PostCardProps) {
  const scale = useSharedValue(1);
  const liked = useSharedValue(false);

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleLike = () => {
    liked.value = !liked.value;
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );
    onLike?.();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={cardStyle}
      className="mx-4 my-2"
    >
      <StyledView className="bg-white rounded-xl p-4 shadow-sm">
        <StyledView className="flex-row items-center mb-3">
          <StyledImage
            source={{ uri: avatarUrl || 'https://via.placeholder.com/40' }}
            className="w-10 h-10 rounded-full"
          />
          <StyledView className="ml-3 flex-1">
            <StyledText className="text-base text-gray-900 font-sora-semibold">{displayName}</StyledText>
            <StyledText className="text-sm text-gray-500 font-sora-regular">@{username}</StyledText>
          </StyledView>
          <StyledText className="text-xs text-gray-400 font-sora-light">{timestamp}</StyledText>
        </StyledView>
        
        {location && (
          <StyledView className="mb-3">
            <StyledView className="flex-row items-center bg-gray-50 self-start px-3 py-1.5 rounded-full">
              <Ionicons name="location-outline" size={14} color="#6366F1" />
              <StyledText className="ml-1 text-sm text-gray-600 font-sora-regular">{location}</StyledText>
            </StyledView>
          </StyledView>
        )}
        
        <StyledView className="flex-row justify-between mt-4">
          <StyledTouchableOpacity 
            onPress={handleLike}
            className="flex-row items-center"
          >
            <Ionicons 
              name={liked.value ? "heart" : "heart-outline"} 
              size={20} 
              color={liked.value ? "#EC4899" : "#6B7280"} 
            />
            <StyledText className="ml-2 text-gray-600 font-sora-regular">{likes}</StyledText>
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity 
            onPress={onComment}
            className="flex-row items-center"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            <StyledText className="ml-2 text-gray-600 font-sora-regular">{comments}</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </AnimatedPressable>
  );
}