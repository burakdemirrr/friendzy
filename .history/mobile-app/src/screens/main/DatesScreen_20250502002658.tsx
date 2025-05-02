import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

type DateInvitation = {
  id: string;
  sender_id: string;
  receiver_id: string;
  date_time: string;
  location: string;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender: {
    username: string;
    avatar_url: string | null;
  };
};

export default function DatesScreen() {
  const [invitations, setInvitations] = useState<DateInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('dates')
        .select(`
          *,
          sender:profiles!dates_sender_id_fkey(username, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .order('date_time', { ascending: true });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('dates')
        .update({ status })
        .eq('id', invitationId);

      if (error) throw error;

      // Refresh the invitations list
      fetchInvitations();
    } catch (error) {
      console.error('Error updating invitation status:', error);
      alert('Failed to update invitation status. Please try again.');
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledView className="px-6 pt-4">
        <StyledText className="text-2xl font-bold text-white mb-4">
          Date Invitations
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-6">
        {loading ? (
          <StyledView className="py-4">
            <StyledText className="text-white text-center">Loading...</StyledText>
          </StyledView>
        ) : invitations.length === 0 ? (
          <StyledView className="py-4">
            <StyledText className="text-gray-400 text-center">
              No date invitations yet
            </StyledText>
          </StyledView>
        ) : (
          <StyledView className="space-y-4">
            {invitations.map((invitation) => (
              <StyledView
                key={invitation.id}
                className="bg-[#1C2438] rounded-xl p-4"
              >
                <StyledView className="flex-row items-center mb-4">
                  <StyledView className="w-10 h-10 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                    {invitation.sender.avatar_url ? (
                      <StyledImage
                        source={{ uri: invitation.sender.avatar_url }}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <Ionicons name="person" size={20} color="#818CF8" />
                    )}
                  </StyledView>
                  <StyledText className="text-white font-medium">
                    {invitation.sender.username}
                  </StyledText>
                </StyledView>

                <StyledView className="space-y-2 mb-4">
                  <StyledView className="flex-row items-center">
                    <Ionicons name="calendar" size={20} color="#818CF8" />
                    <StyledText className="text-white ml-2">
                      {new Date(invitation.date_time).toLocaleDateString()}
                    </StyledText>
                  </StyledView>
                  <StyledView className="flex-row items-center">
                    <Ionicons name="time" size={20} color="#818CF8" />
                    <StyledText className="text-white ml-2">
                      {new Date(invitation.date_time).toLocaleTimeString()}
                    </StyledText>
                  </StyledView>
                  <StyledView className="flex-row items-center">
                    <Ionicons name="location" size={20} color="#818CF8" />
                    <StyledText className="text-white ml-2">
                      {invitation.location}
                    </StyledText>
                  </StyledView>
                  {invitation.notes && (
                    <StyledView className="flex-row items-start">
                      <Ionicons name="document-text" size={20} color="#818CF8" />
                      <StyledText className="text-white ml-2 flex-1">
                        {invitation.notes}
                      </StyledText>
                    </StyledView>
                  )}
                </StyledView>

                {invitation.status === 'pending' && (
                  <StyledView className="flex-row space-x-2">
                    <StyledTouchableOpacity
                      onPress={() => handleResponse(invitation.id, 'accepted')}
                      className="flex-1 bg-green-500 rounded-lg p-2"
                    >
                      <StyledText className="text-white text-center">
                        Accept
                      </StyledText>
                    </StyledTouchableOpacity>
                    <StyledTouchableOpacity
                      onPress={() => handleResponse(invitation.id, 'rejected')}
                      className="flex-1 bg-red-500 rounded-lg p-2"
                    >
                      <StyledText className="text-white text-center">
                        Reject
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                )}

                {invitation.status === 'accepted' && (
                  <StyledView className="bg-green-500/20 rounded-lg p-2">
                    <StyledText className="text-green-400 text-center">
                      Accepted
                    </StyledText>
                  </StyledView>
                )}

                {invitation.status === 'rejected' && (
                  <StyledView className="bg-red-500/20 rounded-lg p-2">
                    <StyledText className="text-red-400 text-center">
                      Rejected
                    </StyledText>
                  </StyledView>
                )}
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 