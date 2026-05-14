import React from 'react';
import { View, Image, StyleSheet, Pressable } from 'react-native';
import { User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface AvatarProps {
  uri?: string;
  size?: number;
  onPress?: () => void;
}

export default function Avatar({ uri, size = 64, onPress }: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={[styles.container, containerStyle]}>
        {uri ? (
          <Image source={{ uri }} style={[styles.image, containerStyle]} />
        ) : (
          <User size={size * 0.4} color={Colors.textDisabled} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
