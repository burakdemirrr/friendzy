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

    const handlePrevMonth = () => {
      const newDate = new Date(postDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setPostDate(newDate);
    };

    const handleNextMonth = () => {
      const newDate = new Date(postDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setPostDate(newDate);
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWebPicker(false)}
        />
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl w-full max-w-md relative animate-slideUp overflow-hidden border border-gray-700/50">
          {/* Header */}
          <div className="bg-[#0F172A] px-6 py-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Choose Date & Time</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {formattedDate} at {formattedTime}
                </p>
              </div>
              <button 
                onClick={() => setShowWebPicker(false)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-white font-semibold text-lg">
                {months[currentMonth]} {currentYear}
              </h3>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar */}
            <div className="mb-6">
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-gray-400 text-xs font-medium pb-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="border border-gray-700/50 rounded-xl overflow-hidden">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-700/50">
                    {week.map((day, dayIndex) => {
                      if (day === null) return (
                        <div 
                          key={`empty-${dayIndex}`} 
                          className="h-12 bg-gray-800/30"
                        />
                      );
                      
                      const date = new Date(currentYear, currentMonth, day);
                      const isSelected = 
                        date.getDate() === postDate.getDate() && 
                        date.getMonth() === postDate.getMonth() && 
                        date.getFullYear() === postDate.getFullYear();
                      const isPast = date < today;
                      const isToday = 
                        date.getDate() === today.getDate() && 
                        date.getMonth() === today.getMonth() && 
                        date.getFullYear() === today.getFullYear();

                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && handleWebDateSelect(day)}
                          disabled={isPast}
                          className={`
                            h-12 w-full flex items-center justify-center relative
                            transition-all duration-200
                            ${isSelected ? 'bg-indigo-500/20' : weekIndex % 2 === 0 ? 'bg-gray-800/30' : 'bg-transparent'}
                            ${isPast ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-indigo-500/10'}
                            ${isToday ? 'font-semibold' : ''}
                          `}
                        >
                          <span className={`
                            w-8 h-8 flex items-center justify-center rounded-full
                            ${isSelected ? 'bg-indigo-500' : ''}
                            ${isToday && !isSelected ? 'border-2 border-indigo-500' : ''}
                          `}>
                            {day}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
              <h4 className="text-gray-400 font-medium">Select Time</h4>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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
                        py-3 rounded-xl text-sm font-medium transition-all duration-200
                        ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-800/50'}
                        ${isPast ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-indigo-500/20'}
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700/50">
              <button
                onClick={() => setShowWebPicker(false)}
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowWebPicker(false)}
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this CSS to your global styles or component
  const styles = `
    .animate-slideUp {
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        transform: translateY(8px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #4F46E5 #1E293B;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #1E293B;
      border-radius: 2px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #4F46E5;
      border-radius: 2px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: #6366F1;
    }
  `;

  // Add the styles to the document head
  if (Platform.OS === 'web') {
    React.useEffect(() => {
      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
      return () => {
        document.head.removeChild(styleSheet);
      };
    }, []);
  }

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