import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Dimensions 
} from 'react-native';
import { 
  Book, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Skull 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import soliloquies from './soliloquies';

const { width, height } = Dimensions.get('window');

const MacbethTranslator = () => {
  const [currentSoliloquyIndex, setCurrentSoliloquyIndex] = useState(0);
  const [translationMode, setTranslationMode] = useState('original');
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const currentSoliloquy = soliloquies[currentSoliloquyIndex];

  const navigateSoliloquy = (direction) => {
    const newIndex = (currentSoliloquyIndex + direction + soliloquies.length) % soliloquies.length;
    setCurrentSoliloquyIndex(newIndex);
    setIsDetailVisible(false);
  };

  const toggleTranslationMode = () => {
    const modes = ['original', 'academic', 'brainrot'];
    const currentIndex = modes.indexOf(translationMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTranslationMode(modes[nextIndex]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0a0a1e', '#1a1a3e', '#2a2a5e']}
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}
      >
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20 
        }}>
          <View>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: 'white' 
            }}>
              {currentSoliloquy.title}
            </Text>
            <Text style={{ 
              color: 'gray', 
              marginTop: 5 
            }}>
              Act {currentSoliloquy.act}
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              onPress={() => setIsDetailVisible(!isDetailVisible)}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                padding: 10, 
                borderRadius: 20 
              }}
            >
              {isDetailVisible ? (
                <Brain color="green" size={24} />
              ) : (
                <Skull color="red" size={24} />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleTranslationMode}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                padding: 10, 
                borderRadius: 20 
              }}
            >
              <Sparkles 
                color={
                  translationMode === 'original' ? 'white' : 
                  translationMode === 'academic' ? 'purple' : 'blue'
                } 
                size={24} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          {/* Psychological Insight */}
          {isDetailVisible && (
            <View style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              padding: 15, 
              borderRadius: 10,
              marginBottom: 15
            }}>
              <Text style={{ 
                color: 'white', 
                fontSize: 16 
              }}>
                {currentSoliloquy.psychologicalInsight}
              </Text>
            </View>
          )}

          {/* Original Text */}
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: 15, 
            borderRadius: 10,
            marginBottom: 15
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 18, 
              fontWeight: 'bold',
              marginBottom: 10 
            }}>
              Original Text
            </Text>
            {currentSoliloquy.original.map((line, index) => (
              <Text 
                key={index} 
                style={{ 
                  color: 'white', 
                  marginBottom: 5 
                }}
              >
                {line}
              </Text>
            ))}
          </View>

          {/* Translation */}
          <View style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: 15, 
            borderRadius: 10 
          }}>
            <Text style={{ 
              color: 'white', 
              fontSize: 18, 
              fontWeight: 'bold',
              marginBottom: 10 
            }}>
              {translationMode === 'original' ? 'Original' : 
               translationMode === 'academic' ? 'Academic' : 'Brainrot'} 
               Translation 
            </Text>
            {currentSoliloquy[translationMode].map((line, index) => (
              <Text 
                key={index} 
                style={{ 
                  color: 'white', 
                  marginBottom: 5 
                }}
              >
                {line}
              </Text>
            ))}
          </View>
        </ScrollView>

        {/* Navigation */}
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
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MacbethTranslator;
