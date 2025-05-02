import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../../lib/supabase';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

type RootStackParamList = {
  SendDate: { friend: { id: string; username: string } };
};

type SendDateScreenRouteProp = RouteProp<RootStackParamList, 'SendDate'>;

export default function SendDateScreen() {
  const route = useRoute<SendDateScreenRouteProp>();
  const { friend } = route.params;
  const navigation = useNavigation();
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendInvitation = async () => {
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('dates')
        .insert({
          sender_id: user.id,
          receiver_id: friend.id,
          date_time: date.toISOString(),
          location,
          notes,
          status: 'pending'
        });

      if (error) throw error;

      navigation.goBack();
    } catch (error) {
      console.error('Error sending date invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledScrollView className="flex-1 px-6">
        <StyledText className="text-2xl font-bold text-white mb-6">
          Send Date Invitation
        </StyledText>

        <StyledView className="mb-6">
          <StyledText className="text-white text-lg mb-2">Friend</StyledText>
          <StyledView className="bg-[#1C2438] rounded-xl p-4">
            <StyledText className="text-white">{friend.username}</StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="mb-6">
          <StyledText className="text-white text-lg mb-2">Date & Time</StyledText>
          <StyledTouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-[#1C2438] rounded-xl p-4"
          >
            <StyledText className="text-white">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <StyledView className="mb-6">
          <StyledText className="text-white text-lg mb-2">Location</StyledText>
          <StyledTextInput
            className="bg-[#1C2438] rounded-xl p-4 text-white"
            placeholder="Enter location"
            placeholderTextColor="#6B7280"
            value={location}
            onChangeText={setLocation}
          />
        </StyledView>

        <StyledView className="mb-6">
          <StyledText className="text-white text-lg mb-2">Notes</StyledText>
          <StyledTextInput
            className="bg-[#1C2438] rounded-xl p-4 text-white h-32"
            placeholder="Add any notes (optional)"
            placeholderTextColor="#6B7280"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </StyledView>

        <StyledTouchableOpacity
          onPress={handleSendInvitation}
          disabled={loading}
          className="bg-indigo-500 rounded-xl p-4 mb-6"
        >
          <StyledText className="text-white text-center font-medium">
            {loading ? 'Sending...' : 'Send Invitation'}
          </StyledText>
        </StyledTouchableOpacity>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 