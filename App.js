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
  Alert, // Alert is fine in React Native
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
// import i18n from 'i18n-js'; // Ensure i18n is configured if used
import soliloquies from './soliloquies'; // Make sure soliloquies.js is in the same directory or update path
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Accelerometer } from 'expo-sensors';

const MacbethTranslator = () => {
  const [currentSoliloquyIndex, setCurrentSoliloquyIndex] = useState(0);
  const [translationMode, setTranslationMode] = useState('academic');
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
  // New state for detailed quiz feedback
  const [quizAttemptFeedback, setQuizAttemptFeedback] = useState(null);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isAudioControlVisible, setIsAudioControlVisible] = useState(false);
  const [brightness, setBrightness] = useState(0.5);
  const [screenOrientationState, setScreenOrientationState] = useState(null); // Renamed to avoid conflict

  // Effect for Accelerometer
  useEffect(() => {
    let subscription;
    const startAccelerometer = async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Accelerometer.requestPermissionsAsync();
        if (status === 'granted') {
          subscription = Accelerometer.addListener(setAccelerometerData);
        } else {
          console.log("Accelerometer permission denied");
        }
      } else {
        console.log("Accelerometer is not supported on web");
      }
    };
    startAccelerometer();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Effect for Brightness
  useEffect(() => {
    const adjustBrightness = async () => {
      if (Platform.OS !== 'web') {
        try {
            const { status } = await Brightness.requestPermissionsAsync();
            if (status === 'granted') {
                await Brightness.setSystemBrightnessAsync(brightness);
            } else {
                console.log("Brightness permission denied");
            }
        } catch (e) {
            console.warn("Error setting brightness:", e);
        }
      }
    };
    adjustBrightness();
  }, [brightness]);

  const currentSoliloquy = soliloquies[currentSoliloquyIndex];

  const toggleTextToSpeech = async () => {
    if (!currentSoliloquy || !currentSoliloquy[translationMode]) {
        Alert.alert("Error", "Content not available for speech.");
        return;
    }
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
        },
        onError: (error) => {
            console.error("Speech error:", error);
            Alert.alert("Speech Error", "Could not play audio.");
            setIsAudioPlaying(false);
            setIsAudioControlVisible(false);
        }
      });
      setIsAudioPlaying(true);
      setIsAudioControlVisible(true);
    }
  };

  const navigateSoliloquy = (direction) => {
    Speech.stop();
    setIsAudioPlaying(false);
    setIsAudioControlVisible(false);
    setCurrentQuizQuestion(null); // Close quiz when navigating
    setQuizAttemptFeedback(null); // Reset quiz feedback

    const newIndex = (currentSoliloquyIndex + direction + soliloquies.length) % soliloquies.length;
    setCurrentSoliloquyIndex(newIndex);
    setUserProgress(prev => ({
      ...prev,
      soliloquiesRead: prev.soliloquiesRead + 1
    }));
  };

  const takeQuiz = () => {
    if (!currentSoliloquy || !currentSoliloquy.quizQuestions || currentSoliloquy.quizQuestions.length === 0) {
        Alert.alert("No Quiz", "No quiz available for this soliloquy.");
        return;
    }
    setQuizAttemptFeedback(null); // Reset feedback if taking a new quiz or retaking
    const questions = currentSoliloquy.quizQuestions;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuizQuestion(randomQuestion);
  };

  const checkQuizAnswer = (selectedAnswerIndex) => {
    if (!currentQuizQuestion) return;

    const isCorrect = selectedAnswerIndex === currentQuizQuestion.correctAnswer;
    setQuizAttemptFeedback({
        selectedIndex: selectedAnswerIndex,
        correctIndex: currentQuizQuestion.correctAnswer,
        isCorrect: isCorrect
    });

    if (isCorrect) {
      setUserProgress(prev => ({
        ...prev,
        quizzesPassed: prev.quizzesPassed + 1
      }));
      Alert.alert("Correct!", "You've gained insights into the soliloquy.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert("Incorrect", "Review the feedback and try reading the soliloquy again carefully.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    // Do NOT set setCurrentQuizQuestion(null) here anymore, let the user see the feedback
  };

  // Function to close the quiz and reset feedback
  const closeQuiz = () => {
    setCurrentQuizQuestion(null);
    setQuizAttemptFeedback(null);
  };

  const generateThumbnail = async (videoUri) => {
    if (Platform.OS === 'web') {
        console.log("VideoThumbnails not supported on web.");
        return null;
    }
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 15000,
      });
      return uri;
    } catch (e) {
      console.warn("Error generating thumbnail:", e);
      return null;
    }
  };

  const shareContent = async () => {
    if (!currentSoliloquy || !currentSoliloquy[translationMode]) {
        Alert.alert("Error", "No content to share.");
        return;
    }
    try {
      const result = await Share.share({
        message: `Check out this Macbeth soliloquy: ${currentSoliloquy.title}\n\n${currentSoliloquy[translationMode].join('\n')}`,
        title: `Macbeth Soliloquy: ${currentSoliloquy.title}`
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Shared via ${result.activityType}`);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      Alert.alert('Share Error', 'Could not share the soliloquy.');
      console.error("Share error:", error.message);
    }
  };

  const renderSoliloquyContent = (contentType) => {
    if (!currentSoliloquy || !currentSoliloquy[contentType]) {
        return <Text style={styles.soliloquyLine}>Content not available.</Text>;
    }
    const content = currentSoliloquy[contentType];
    return content.map((line, index) => (
      <Text key={`${contentType}-${index}`} style={styles.soliloquyLine}>
        {line}
      </Text>
    ));
  };

  if (!currentSoliloquy) {
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#0a0a1e', '#1a1a3e', '#2a2a5e']} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Soliloquies...</Text>
            </LinearGradient>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? "light-content" : "light-content"} backgroundColor="#0a0a1e" />
      <LinearGradient
        colors={['#0a0a1e', '#1a1a3e', '#2a2a5e']}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <Text style={styles.titleText}>
            {currentSoliloquy.title}
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={toggleTextToSpeech} style={styles.iconButton}>
              <Volume2 color={isAudioPlaying ? '#FFD700' : 'white'} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={takeQuiz} style={styles.iconButton} disabled={currentQuizQuestion !== null && quizAttemptFeedback === null}>
              {/* Disable taking quiz if one is already active and unanswered */}
              <Hash color={(currentQuizQuestion !== null && quizAttemptFeedback === null) ? 'grey' : 'white'} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={shareContent} style={styles.iconButton}>
              <Quote color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {currentQuizQuestion && (
          <View style={styles.quizContainer}>
            <Text style={styles.quizQuestionText}>
              {currentQuizQuestion.question}
            </Text>
            {currentQuizQuestion.options.map((option, index) => {
              const isAttempted = quizAttemptFeedback !== null;
              let optionStyle = [styles.quizOptionButton];
              let isSelectedOption = false;
              let isCorrectOption = false;

              if (isAttempted) {
                isSelectedOption = index === quizAttemptFeedback.selectedIndex;
                isCorrectOption = index === quizAttemptFeedback.correctIndex;

                if (isSelectedOption) {
                  optionStyle.push(quizAttemptFeedback.isCorrect ? styles.correctAnswerBackground : styles.incorrectAnswerBackground);
                } else if (isCorrectOption) {
                  // Highlight the actual correct answer if the user picked wrong, or even if they picked right (for clarity)
                  optionStyle.push(styles.actualCorrectAnswerHighlight);
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => !isAttempted && checkQuizAnswer(index)}
                  style={optionStyle}
                  disabled={isAttempted}
                >
                  <Text style={styles.quizOptionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
            {quizAttemptFeedback && ( // Show Close Quiz button only after an attempt
                 <TouchableOpacity onPress={closeQuiz} style={styles.closeQuizButton}>
                    <Text style={styles.closeQuizButtonText}>Close Quiz</Text>
                 </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.soliloquySection}>
            <Text style={styles.sectionTitle}>Original Text</Text>
            {renderSoliloquyContent('original')}
          </View>
          <View style={styles.soliloquySection}>
            <Text style={styles.sectionTitle}>
              {translationMode === 'academic' ? 'Academic Translation' : 'Brainrot Translation'}
            </Text>
            {renderSoliloquyContent(translationMode)}
          </View>
        </ScrollView>

        <View style={styles.footerControls}>
          <TouchableOpacity
            onPress={() => navigateSoliloquy(-1)}
            style={[styles.navButton, styles.prevButton]}
          >
            <ChevronLeft color="white" size={24} />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTranslationMode(mode => mode === 'academic' ? 'brainrot' : 'academic')}
            style={styles.modeButton}
          >
            <Text style={styles.modeButtonText}>
              {translationMode === 'academic' ? <Skull color="white" size={18}/> : <Brain color="white" size={18}/>}
              {' '}
              {translationMode === 'academic' ? 'Brainrot' : 'Academic'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateSoliloquy(1)}
            style={[styles.navButton, styles.nextButton]}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <ChevronRight color="white" size={24} />
          </TouchableOpacity>
        </View>

        {isAudioControlVisible && (
          <View style={styles.audioControlContainer}>
            <TouchableOpacity
              onPress={() => setIsAudioControlVisible(false)}
              style={styles.closeAudioControlButton}
            >
              <X color="white" size={24} />
            </TouchableOpacity>
            <View style={styles.audioControlContent}>
              <TouchableOpacity onPress={toggleTextToSpeech}>
                {isAudioPlaying ? (
                  <PauseCircle color="white" size={48} />
                ) : (
                  <PlayCircle color="white" size={48} />
                )}
              </TouchableOpacity>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Speech Speed</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.5}
                  maximumValue={2}
                  value={textSpeed}
                  onValueChange={setTextSpeed}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#AAAAAA"
                  thumbTintColor="#FFD700"
                />
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  gradientContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    flexShrink: 1,
    marginRight: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  quizContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  quizQuestionText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  quizOptionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 2, // Base border
    borderColor: 'transparent', // Default to transparent
  },
  quizOptionText: {
    color: 'white',
    fontSize: 15,
  },
  // Styles for quiz feedback
  correctAnswerBackground: {
    backgroundColor: 'rgba(0, 200, 0, 0.3)', // Light green for selected correct
    borderColor: 'green',
  },
  incorrectAnswerBackground: {
    backgroundColor: 'rgba(200, 0, 0, 0.3)', // Light red for selected incorrect
    borderColor: 'red',
  },
  actualCorrectAnswerHighlight: {
    // Used for the actual correct answer when not selected, or to emphasize it
    borderColor: 'rgba(0, 255, 0, 0.7)', // Bright green border
    // backgroundColor: 'rgba(0,150,0,0.2)', // Optional: slightly different background
  },
  closeQuizButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
  },
  closeQuizButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  soliloquySection: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  soliloquyLine: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevButton: {},
  nextButton: {},
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  modeButton: {
    backgroundColor: 'rgba(70, 70, 130, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  audioControlContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeAudioControlButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 5,
  },
  audioControlContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 15,
    alignItems: 'stretch',
  },
  sliderLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default MacbethTranslator;
