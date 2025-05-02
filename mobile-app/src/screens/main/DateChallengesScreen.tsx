import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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

type Challenge = {
  id: string;
  date_id: string;
  title: string;
  description: string;
  is_completed: boolean;
};

type DateInfo = {
  id: string;
  date_time: string;
  location: string;
  notes: string;
  sender: {
    username: string;
    avatar_url: string | null;
  };
};

export default function DateChallengesScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dateId } = route.params as { dateId: string };
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDateInfo();
    fetchChallenges();
  }, [dateId]);

  const fetchDateInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('dates')
        .select(`
          *,
          sender:profiles!dates_sender_id_fkey(username, avatar_url)
        `)
        .eq('id', dateId)
        .single();

      if (error) throw error;
      setDateInfo(data);
    } catch (error) {
      console.error('Error fetching date info:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('date_id', dateId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChallenge = async (challengeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({ is_completed: !currentStatus })
        .eq('id', challengeId);

      if (error) throw error;

      // Update local state
      setChallenges(challenges.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, is_completed: !currentStatus }
          : challenge
      ));
    } catch (error) {
      console.error('Error updating challenge status:', error);
      alert('Failed to update challenge status. Please try again.');
    }
  };

  if (loading || !dateInfo) {
    return (
      <StyledSafeAreaView className="flex-1 bg-[#0A0F1C] items-center justify-center">
        <StyledText className="text-white">Loading...</StyledText>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledView className="px-6 pt-4">
        <StyledText className="text-2xl font-bold text-white mb-4">
          Date Challenges
        </StyledText>

        <StyledView className="bg-[#1C2438] rounded-xl p-4 mb-6">
          <StyledView className="flex-row items-center mb-2">
            <Ionicons name="calendar" size={20} color="#818CF8" />
            <StyledText className="text-white ml-2">
              {new Date(dateInfo.date_time).toLocaleDateString()}
            </StyledText>
          </StyledView>
          <StyledView className="flex-row items-center mb-2">
            <Ionicons name="time" size={20} color="#818CF8" />
            <StyledText className="text-white ml-2">
              {new Date(dateInfo.date_time).toLocaleTimeString()}
            </StyledText>
          </StyledView>
          <StyledView className="flex-row items-center">
            <Ionicons name="location" size={20} color="#818CF8" />
            <StyledText className="text-white ml-2">
              {dateInfo.location}
            </StyledText>
          </StyledView>
          {dateInfo.notes && (
            <StyledView className="mt-2">
              <StyledText className="text-gray-400">
                {dateInfo.notes}
              </StyledText>
            </StyledView>
          )}
        </StyledView>
      </StyledView>

      <StyledScrollView className="flex-1 px-6">
        {challenges.length === 0 ? (
          <StyledView className="py-4">
            <StyledText className="text-gray-400 text-center">
              No challenges yet
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="space-y-4">
            {challenges.map((challenge) => (
              <StyledView
                key={challenge.id}
                className="bg-[#1C2438] rounded-xl p-4"
              >
                <StyledView className="flex-row items-start justify-between">
                  <StyledView className="flex-1">
                    <StyledText className="text-white font-medium text-lg mb-2">
                      {challenge.title}
                    </StyledText>
                    <StyledText className="text-gray-400">
                      {challenge.description}
                    </StyledText>
                  </StyledView>
                  <StyledTouchableOpacity
                    onPress={() => toggleChallenge(challenge.id, challenge.is_completed)}
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      challenge.is_completed ? 'bg-green-500' : 'bg-[#2D3748]'
                    }`}
                  >
                    {challenge.is_completed ? (
                      <Ionicons name="checkmark" size={20} color="white" />
                    ) : null}
                  </StyledTouchableOpacity>
                </StyledView>
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 