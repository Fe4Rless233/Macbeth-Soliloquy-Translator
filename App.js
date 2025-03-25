import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Dimensions,
  Animated,
  Modal,
  Share,
  Alert,
  Platform,
  StyleSheet,
  Image
} from 'react-native';
import { 
  Book, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Skull,
  Quote,
  Music,
  Film,
  Info,
  User,
  Theater,
  Settings,
  Volume2,
  Palette,
  MapPin,
  Award,
  Clock,
  X,
  Bookmark,
  Hash,
  Zap,
  Globe,
  Headphones,
  PlayCircle,
  PauseCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import soliloquies from './soliloquies';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Accelerometer } from 'expo-sensors';

const MacbethTranslator = () => {
  const [currentSoliloquyIndex, setCurrentSoliloquyIndex] = useState(0);
  const [translationMode, setTranslationMode] = useState('original');
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [textSpeed, setTextSpeed] = useState(1);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [bookmarkedSoliloquies, setBookmarkedSoliloquies] = useState([]);
  const [userProgress, setUserProgress] = useState({
    soliloquiesRead: 0,
    totalTimeSpent: 0,
    achievementsUnlocked: 0,
    quizzesPassed: 0
  });
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isAudioControlVisible, setIsAudioControlVisible] = useState(false);
  const [brightness, setBrightness] = useState(0.5);
  const [screenOrientation, setScreenOrientation] = useState(null);

  useEffect(() => {
    const subscription = Accelerometer.addListener(setAccelerometerData);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const adjustBrightness = async () => {
      await Brightness.setSystemBrightnessAsync(brightness);
    };
    adjustBrightness();
  }, [brightness]);

  const toggleTextToSpeech = async () => {
    if (isAudioPlaying) {
      Speech.stop();
      setIsAudioPlaying(false);
      setIsAudioControlVisible(false);
    } else {
      const textToSpeak = currentSoliloquy[translationMode].join(' ');
      Speech.speak(textToSpeak, {
        rate: textSpeed,
        pitch: 1,
        onDone: () => {
          setIsAudioPlaying(false);
          setIsAudioControlVisible(false);
        }
      });
      setIsAudioPlaying(true);
      setIsAudioControlVisible(true);
    }
  };

  const navigateSoliloquy = (direction) => {
    const newIndex = (currentSoliloquyIndex + direction + soliloquies.length) % soliloquies.length;
    setCurrentSoliloquyIndex(newIndex);
    
    setUserProgress(prev => ({
      ...prev,
      soliloquiesRead: prev.soliloquiesRead + 1
    }));
  };

  const takeQuiz = () => {
    const questions = currentSoliloquy.quizQuestions;
    if (questions && questions.length > 0) {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuizQuestion(randomQuestion);
    }
  };

  const checkQuizAnswer = (selectedAnswer) => {
    if (selectedAnswer === currentSoliloquy.quizQuestions[0].correctAnswer) {
      setUserProgress(prev => ({
        ...prev,
        quizzesPassed: prev.quizzesPassed + 1
      }));
      Alert.alert("Correct!", "You've gained insights into the soliloquy.");
    } else {
      Alert.alert("Incorrect", "Try reading the soliloquy again carefully.");
    }
    setCurrentQuizQuestion(null);
  };

  const generateThumbnail = async (videoUri) => {
    try {
      const { uri } = await VideoThumbnails.getThumbnail(videoUri, {
        time: 15000,
      });
      return uri;
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  const shareContent = async () => {
    try {
      const result = await Share.share({
        message: `Check out this Macbeth soliloquy: ${currentSoliloquy.title}\n\n${currentSoliloquy[translationMode].join('\n')}`,
        title: 'Macbeth Soliloquy'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the soliloquy');
    }
  };

  const currentSoliloquy = soliloquies[currentSoliloquyIndex];

  const renderSoliloquyContent = (contentType) => {
    const content = currentSoliloquy?.[contentType] || ["No content available"];
    return content.map((line, index) => (
      <Text key={index} style={styles.soliloquyLine}>
        {line}
      </Text>
    ));
  };

  const styles = StyleSheet.create({
    soliloquyLine: {
      color: 'white',
      marginBottom: 5
    },
    container: {
      flex: 1,
      backgroundColor: '#0a0a1e'
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a1e', '#1a1a3e', '#2a2a5e']}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 24 }}>
            {currentSoliloquy.title}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity onPress={toggleTextToSpeech}>
              <Volume2 color={isAudioPlaying ? 'yellow' : 'white'} size={24} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={takeQuiz}>
              <Hash color="white" size={24} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={shareContent}>
              <Quote color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {currentQuizQuestion && (
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.2)', 
            padding: 15, 
            borderRadius: 10,
            marginVertical: 10
          }}>
            <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>
              {currentQuizQuestion.question}
            </Text>
            {currentQuizQuestion.options.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => checkQuizAnswer(index)}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: 10, 
                  borderRadius: 5,
                  marginVertical: 5
                }}
              >
                <Text style={{ color: 'white' }}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView>
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: 15, 
            borderRadius: 10,
            marginVertical: 10
          }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              Original Text
            </Text>
            {renderSoliloquyContent('original')}
          </View>

          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: 15, 
            borderRadius: 10
          }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
              {translationMode === 'academic' ? 'Academic Translation' : 'Brainrot Translation'}
            </Text>
            {renderSoliloquyContent(translationMode)}
          </View>
        </ScrollView>

        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginTop: 15 
        }}>
          <TouchableOpacity 
            onPress={() => navigateSoliloquy(-1)}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              padding: 10, 
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <ChevronLeft color="white" size={24} />
            <Text style={{ color: 'white', marginLeft: 5 }}>Previous</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity 
              onPress={() => setTranslationMode(mode => mode === 'academic' ? 'brainrot' : 'academic')}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                padding: 10, 
                borderRadius: 20
              }}
            >
              <Text style={{ color: 'white' }}>
                {translationMode === 'academic' ? 'Brainrot Mode' : 'Academic Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigateSoliloquy(1)}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                padding: 10, 
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Text style={{ color: 'white', marginRight: 5 }}>Next</Text>
              <ChevronRight color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {isAudioControlVisible && (
          <View style={{ 
            position: 'absolute', 
            bottom: 20, 
            left: 20, 
            right: 20, 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            borderRadius: 10, 
            padding: 15 
          }}>
            <TouchableOpacity 
              onPress={() => setIsAudioControlVisible(false)}
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              <X color="white" size={24} />
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={toggleTextToSpeech}>
                {isAudioPlaying ? (
                  <PauseCircle color="white" size={48} />
                ) : (
                  <PlayCircle color="white" size={48} />
                )}
              </TouchableOpacity>
              
              <Text style={{ color: 'white', marginLeft: 15 }}>Speech Speed</Text>
              <Slider
                style={{ width: 150, marginLeft: 10 }}
                minimumValue={0.5}
                maximumValue={2}
                value={textSpeed}
                onValueChange={setTextSpeed}
                minimumTrackTintColor="white"
                maximumTrackTintColor="gray"
              />
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MacbethTranslator;
