import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [isPosting, setIsPosting] = useState(false);
  const [showWebPicker, setShowWebPicker] = useState(false);

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

  // Format the date for web input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle web datetime change
  const handleWebDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setPostDate(newDate);
  };

  // Handle mobile date/time change
  const handleMobileDateTimeChange = (event: DateTimePickerEvent, selectedValue?: Date) => {
    const { type } = event;
    
    // Handle Android cancel action
    if (type === 'dismissed' || (Platform.OS === 'android' && !selectedValue)) {
      setShowDatePicker(false);
      setShowTimePicker(false);
      return;
    }
    
    if (selectedValue) {
      const newDate = new Date(postDate);
      
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
      
      setPostDate(newDate);
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

  const formattedDate = postDate.toLocaleDateString();
  const formattedTime = postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };

  const handleWebDateSelect = (day: number) => {
    const newDate = new Date(postDate);
    newDate.setDate(day);
    setPostDate(newDate);
  };

  const handleWebTimeSelect = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(postDate);
    newDate.setHours(hours, minutes);
    setPostDate(newDate);
    setShowWebPicker(false);
  };

  const renderWebDatePicker = () => {
    const currentYear = postDate.getFullYear();
    const currentMonth = postDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date();
    const timeSlots = generateTimeSlots();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const weeks = [];
    let week = Array(firstDayOfMonth).fill(null);

    days.forEach(day => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      weeks.push(week.concat(Array(7 - week.length).fill(null)));
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#1C2438] rounded-xl p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setShowWebPicker(false)}
              className="text-red-500 font-medium"
            >
              Cancel
            </button>
            <h2 className="text-white font-bold text-lg">
              {months[currentMonth]} {currentYear}
            </h2>
            <button 
              onClick={() => setShowWebPicker(false)}
              className="text-indigo-500 font-medium"
            >
              Done
            </button>
          </div>

          {/* Calendar */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-400 text-sm">
                  {day}
                </div>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  if (day === null) return <div key={`empty-${dayIndex}`} />;
                  
                  const date = new Date(currentYear, currentMonth, day);
                  const isSelected = 
                    date.getDate() === postDate.getDate() && 
                    date.getMonth() === postDate.getMonth() && 
                    date.getFullYear() === postDate.getFullYear();
                  const isPast = date < today;

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && handleWebDateSelect(day)}
                      disabled={isPast}
                      className={`
                        h-8 w-8 rounded-full flex items-center justify-center text-sm
                        ${isSelected ? 'bg-indigo-500 text-white' : ''}
                        ${isPast ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-indigo-500/20'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Time Picker */}
          <div className="mt-4 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(time => {
                const [hours, minutes] = time.split(':').map(Number);
                const timeDate = new Date(postDate);
                timeDate.setHours(hours, minutes);
                const isPast = timeDate < today;
                const isSelected = 
                  hours === postDate.getHours() && 
                  minutes === postDate.getMinutes();

                return (
                  <button
                    key={time}
                    onClick={() => !isPast && handleWebTimeSelect(time)}
                    disabled={isPast}
                    className={`
                      py-1 px-2 rounded text-sm
                      ${isSelected ? 'bg-indigo-500 text-white' : ''}
                      ${isPast ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-indigo-500/20'}
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDateTimePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <>
          <StyledView className="flex-row space-x-2 mb-3">
            <StyledTouchableOpacity
              onPress={() => setShowWebPicker(true)}
              className="flex-1 bg-[#0F172A] rounded-xl p-2.5 flex-row items-center justify-between"
            >
              <StyledView className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#818CF8" />
                <StyledText className="text-white ml-2 font-sora-regular">
                  {formattedDate} {formattedTime}
                </StyledText>
              </StyledView>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </StyledTouchableOpacity>
          </StyledView>
          {showWebPicker && renderWebDatePicker()}
        </>
      );
    }

    return (
      <>
        <StyledView className="flex-row space-x-2 mb-3">
          <StyledTouchableOpacity
            onPress={openDatePicker}
            className="flex-1 bg-[#0F172A] rounded-xl p-2.5 flex-row items-center justify-between"
          >
            <StyledView className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#818CF8" />
              <StyledText className="text-white ml-2 font-sora-regular">{formattedDate}</StyledText>
            </StyledView>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </StyledTouchableOpacity>
          
          <StyledTouchableOpacity
            onPress={openTimePicker}
            className="flex-1 bg-[#0F172A] rounded-xl p-2.5 flex-row items-center justify-between"
          >
            <StyledView className="flex-row items-center">
              <Ionicons name="time-outline" size={20} color="#818CF8" />
              <StyledText className="text-white ml-2 font-sora-regular">{formattedTime}</StyledText>
            </StyledView>
            <Ionicons name="chevron-down" size={16} color="#64748B" />
          </StyledTouchableOpacity>
        </StyledView>

        {/* Date & Time Picker for Android */}
        {Platform.OS === 'android' && (
          <>
            {showDatePicker && (
              <DateTimePicker
                value={postDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={handleMobileDateTimeChange}
                minimumDate={new Date()}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={postDate}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleMobileDateTimeChange}
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
                    <StyledText className="text-red-500 font-sora-medium">Cancel</StyledText>
                  </StyledTouchableOpacity>
                  
                  <StyledText className="text-white font-sora-bold">
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
                    <StyledText className="text-indigo-500 font-sora-medium">
                      {pickerMode === 'date' ? 'Next' : 'Done'}
                    </StyledText>
                  </StyledTouchableOpacity>
                </StyledView>
                
                <DateTimePicker
                  value={postDate}
                  mode={pickerMode}
                  display="spinner"
                  onChange={handleMobileDateTimeChange}
                  style={{ backgroundColor: '#1C2438' }}
                  textColor="#FFFFFF"
                  minimumDate={new Date()}
                />
              </StyledView>
            </StyledView>
          </Modal>
        )}
      </>
    );
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

      {renderDateTimePicker()}

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