import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Modal } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { supabase } from '../../../lib/supabase';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendInvitation = async () => {
    // Validate required fields
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }
    
    if (!notes.trim()) {
      alert('Please add a description for the date');
      return;
    }
    
    // Validate date is in the future
    const now = new Date();
    if (date <= now) {
      alert('Please choose a future date and time');
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

  // Formatted display strings for selected date and time
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Handle date or time change
  const handleDateTimeChange = (event: DateTimePickerEvent, selectedValue?: Date) => {
    const { type } = event;
    
    // Handle Android cancel action
    if (type === 'dismissed' || (Platform.OS === 'android' && !selectedValue)) {
      setShowDatePicker(false);
      setShowTimePicker(false);
      return;
    }
    
    if (selectedValue) {
      const newDate = new Date(date);
      
      if (pickerMode === 'date') {
        newDate.setFullYear(
          selectedValue.getFullYear(),
          selectedValue.getMonth(),
          selectedValue.getDate()
        );
        
        // On iOS, automatically show time picker after setting date
        if (Platform.OS === 'ios') {
          setPickerMode('time');
        } else if (Platform.OS === 'android') {
          // On Android, we need to manually show the time picker
          setShowDatePicker(false);
          setTimeout(() => {
            setPickerMode('time');
            setShowTimePicker(true);
          }, 300);
        }
      } else {
        newDate.setHours(selectedValue.getHours(), selectedValue.getMinutes());
        // Close the picker after time is selected
        if (Platform.OS === 'ios') {
          setShowDatePicker(false);
          setShowTimePicker(false);
        }
      }
      
      setDate(newDate);
    }
  };

  const openDatePicker = () => {
    setPickerMode('date');
    setShowDatePicker(true);
    setShowTimePicker(false);
  };

  const openTimePicker = () => {
    setPickerMode('time');
    setShowTimePicker(true);
    setShowDatePicker(false);
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
          <StyledText className="text-white text-lg mb-2">
            Date & Time <StyledText className="text-red-500">*</StyledText>
          </StyledText>
          
          <StyledView className="flex-row space-x-3">
            {/* Date Picker */}
            <StyledTouchableOpacity
              onPress={openDatePicker}
              className="flex-1 bg-[#1C2438] rounded-xl p-4 flex-row items-center justify-between"
            >
              <StyledView className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#818CF8" />
                <StyledText className="text-white ml-2">{formattedDate}</StyledText>
              </StyledView>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </StyledTouchableOpacity>
            
            {/* Time Picker */}
            <StyledTouchableOpacity
              onPress={openTimePicker}
              className="flex-1 bg-[#1C2438] rounded-xl p-4 flex-row items-center justify-between"
            >
              <StyledView className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#818CF8" />
                <StyledText className="text-white ml-2">{formattedTime}</StyledText>
              </StyledView>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Date & Time Picker for Android */}
        {Platform.OS === 'android' && (
          <>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleDateTimeChange}
                minimumDate={new Date()}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleDateTimeChange}
              />
            )}
          </>
        )}

        {/* Date & Time Picker for iOS */}
        {Platform.OS === 'ios' && (showDatePicker || showTimePicker) && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker || showTimePicker}
          >
            <StyledView className="flex-1 justify-end bg-black/50">
              <StyledView className="bg-[#1C2438] rounded-t-xl p-4">
                <StyledView className="flex-row justify-between items-center mb-4">
                  <StyledTouchableOpacity 
                    onPress={() => {
                      setShowDatePicker(false);
                      setShowTimePicker(false);
                      setPickerMode('date');
                    }}
                  >
                    <StyledText className="text-red-500">Cancel</StyledText>
                  </StyledTouchableOpacity>
                  
                  <StyledText className="text-white font-bold">
                    {pickerMode === 'date' ? 'Select Date' : 'Select Time'}
                  </StyledText>
                  
                  <StyledTouchableOpacity 
                    onPress={() => {
                      if (pickerMode === 'date') {
                        setPickerMode('time');
                      } else {
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                        setPickerMode('date');
                      }
                    }}
                  >
                    <StyledText className="text-indigo-500">
                      {pickerMode === 'date' ? 'Next' : 'Done'}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
                
                <DateTimePicker
                  value={date}
                  mode={pickerMode}
                  display="spinner"
                  onChange={handleDateTimeChange}
                  style={{ backgroundColor: '#1C2438' }}
                  textColor="#FFFFFF"
                  minimumDate={new Date()}
                />
              </StyledView>
            </StyledView>
          </Modal>
        )}

        <StyledView className="mb-6">
          <StyledText className="text-white text-lg mb-2">
            Location <StyledText className="text-red-500">*</StyledText>
          </StyledText>
          <StyledTextInput
            className="bg-[#1C2438] rounded-xl p-4 text-white"
            placeholder="Enter location"
            placeholderTextColor="#6B7280"
            value={location}
            onChangeText={setLocation}
          />
        </StyledView>

        <StyledView className="mb-6">
          <StyledText className="text-white text-lg mb-2">
            Description <StyledText className="text-red-500">*</StyledText>
          </StyledText>
          <StyledTextInput
            className="bg-[#1C2438] rounded-xl p-4 text-white h-32"
            placeholder="Add details about the date"
            placeholderTextColor="#6B7280"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </StyledView>

        <StyledView className="mb-4">
          <StyledText className="text-red-500 text-xs">
            * Required fields
          </StyledText>
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