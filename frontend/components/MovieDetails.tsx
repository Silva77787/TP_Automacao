import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Movie } from '@/types/movie';

interface MovieDetailsProps {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
}

export function MovieDetails({ movie, visible, onClose }: MovieDetailsProps) {
  if (!movie) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: movie.image }}
              style={styles.image}
              contentFit="cover"
            />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{movie.title}</Text>

            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.metaText}>{movie.rating.toFixed(1)}/10</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#687076" />
                <Text style={styles.metaText}>{movie.year}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#687076" />
                <Text style={styles.metaText}>{movie.runtime} min</Text>
              </View>
            </View>

            <View style={styles.badgeContainer}>
              <Badge>{movie.genre}</Badge>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.sectionText}>{movie.description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Director</Text>
              <Text style={styles.sectionText}>{movie.director}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cast</Text>
              <Text style={styles.sectionText}>{movie.cast.join(', ')}</Text>
            </View>

            <View style={styles.actions}>
              <Button style={styles.actionButton} size="lg">
                Watch Trailer
              </Button>
              <Button
                variant="outline"
                style={styles.actionButton}
                size="lg"
              >
                Add to Watchlist
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#11181C',
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#687076',
  },
  badgeContainer: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#687076',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#11181C',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
});

