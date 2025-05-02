import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function FriendsScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledView className="px-6 pt-4">
        <StyledText className="text-2xl font-bold text-white">
          Friends
        </StyledText>
      </StyledView>
      
      <StyledScrollView className="flex-1 px-6 pt-4">
        {/* Friends will be listed here */}
        <StyledView className="space-y-4">
          <StyledText className="text-gray-400 text-center">
            No friends yet
          </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 