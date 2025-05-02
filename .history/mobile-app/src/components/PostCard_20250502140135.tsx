import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, typography, layout } from '../styles/theme';

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
    <View style={styles.card}>
      {/* Header with avatar and username */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
        </View>
        <TouchableOpacity style={styles.bellIcon}>
          <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{timestamp}</Text>

      {/* Date indicator */}
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
        <Text style={styles.dateText}>Invalid Date</Text>
      </View>

      {/* Location */}
      {location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}

      {/* Interaction buttons */}
      <View style={styles.interactionContainer}>
        <TouchableOpacity style={styles.interactionButton} onPress={onLike}>
          <Ionicons name="heart-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.interactionCount}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.interactionCount}>{comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...layout.card,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    ...typography.avatar.md,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...typography.h3,
  },
  bellIcon: {
    padding: 4,
  },
  timestamp: {
    ...typography.caption,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    ...typography.caption,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    ...typography.caption,
    marginLeft: 8,
  },
  interactionContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  interactionCount: {
    ...typography.caption,
    marginLeft: 4,
  },
}); 