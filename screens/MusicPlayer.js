import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';

const MusicPlayer = () => {
  return (
    <View style={style.container}>
      <Ionicons name="heart-outline" size={30} />
      <Text>MusicPlayer</Text>
    </View>
  );
};

export default MusicPlayer;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
