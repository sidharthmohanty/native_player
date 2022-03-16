import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import songs from '../model/Data';

import React, {useEffect, useRef, useState} from 'react';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';

const {width, height} = Dimensions.get('window');
const MusicPlayer = () => {
  const progress = useProgress();
  const playBackState = usePlaybackState();
  const [songIndex, setSongIndex] = useState(0);
  const [trackTitle, setTrackTitle] = useState();
  const [trackArtist, setTrackArtist] = useState();
  const [trackArtwork, setTrackArtwork] = useState();
  // custom references
  const scrollX = useRef(new Animated.Value(0)).current;
  const songSlider = useRef(null);

  useEffect(() => {
    setUpPlayer();
    scrollX.addListener(({value}) => {
      const index = Math.round(value / width);
      skipTo(index);
      setSongIndex(index);
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  const setUpPlayer = async () => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.add(songs);
    } catch (e) {
      console.log(e);
    }
  };

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, artwork, artist} = track;
      setTrackTitle(title);
      setTrackArtist(artist);
      setTrackArtwork(artwork);
    }
  });

  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  const togglePlayBack = async playBackState => {
    const currentTrack = await TrackPlayer.getCurrentTrack();
    if (currentTrack != null) {
      if (playBackState == State.Paused) {
        console.log(currentTrack);
        console.log('playing');

        await TrackPlayer.play();
      } else {
        console.log('pausing');
        await TrackPlayer.pause();
      }
    } else {
      console.log('no tracks found');
    }
  };

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };

  const skipToPrevious = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };
  const renderSongs = ({item, index}) => {
    return (
      <Animated.View style={style.mainImageWrapper}>
        <View style={[style.imageWrapper, style.elevation]}>
          <Image source={trackArtwork} style={style.musicImage} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={style.container}>
      <View style={style.maincontainer}>
        <Animated.FlatList
          ref={songSlider}
          renderItem={renderSongs}
          data={songs}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    x: scrollX,
                  },
                },
              },
            ],
            {useNativeDriver: true},
          )}
        />

        {/* Song content */}
        <View>
          <Text style={[style.songTitle, style.songContent]}>
            {songs[songIndex].title}
          </Text>
          <Text style={[style.songArtist, style.songContent]}>
            {songs[songIndex].artist}
          </Text>
        </View>

        {/* slider */}

        <View>
          <Slider
            value={progress.position}
            style={style.progressBar}
            minimumValue={0}
            maximumValue={progress.duration}
            thumbTintColor="#FFD369"
            minimumTrackTintColor="#FFD369"
            maximumTrackTintColor="#fff"
            onSlidingComplete={async value => await TrackPlayer.seekTo(value)}
          />
        </View>

        {/* Music progress duration */}
        <View style={style.progressLevelDuration}>
          <Text style={style.progressLevelText}>
            {new Date(progress.position).toLocaleTimeString().substring(4)}
          </Text>
          <Text style={style.progressLevelText}>
            {new Date(progress.duration - progress.position)
              .toLocaleTimeString()
              .substring(4)}
          </Text>
        </View>
        {/* music controls */}
        <View style={style.musicControlsContainer}>
          <TouchableOpacity onPress={skipToPrevious}>
            <Ionicons name="play-skip-back-outline" size={35} color="#FFD369" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => togglePlayBack(playBackState)}>
            <Ionicons
              name={
                playBackState === State.Playing
                  ? 'ios-pause-circle'
                  : 'ios-play-circle'
              }
              size={75}
              color="#FFD369"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipToNext}>
            <Ionicons
              name="play-skip-forward-outline"
              size={30}
              color="#FFD369"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={style.bottomContainer}>
        <View style={style.bottomContainerWrapper}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={30} color="#888888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="repeat" size={30} color="#888888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="share-outline" size={30} color="#888888" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={30} color="#888888" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MusicPlayer;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
  },
  maincontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
    borderTopColor: '#393E46',
    borderWidth: 1,
  },
  bottomContainerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },

  mainImageWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: 300,
    height: 340,
    marginBottom: 25,
  },
  musicImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },

  elevation: {
    elevation: 5,

    shadowColor: '#ccc',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
  },

  songContent: {
    textAlign: 'center',
    color: '#EEEEEE',
  },
  songArtist: {
    fontSize: 18,
    fontWeight: '600',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '300',
  },
  progressBar: {
    width: 350,
    height: 40,
    marginTop: 25,
    flexDirection: 'row',
  },
  progressLevelDuration: {
    width: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLevelText: {
    color: '#fff',
    fontWeight: '500',
  },

  musicControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 15,
  },
});
