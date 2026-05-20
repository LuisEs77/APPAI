import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageItem {
  uri: string;
  base64: string;
  id: string;
}

interface ImageCarouselProps {
  images: ImageItem[];
  onRemoveImage: (id: string) => void;
  onSelectImage: (index: number) => void;
  currentIndex: number;
}

const { width, height } = Dimensions.get('window');

/**
 * Componente Carrusel de Imágenes
 * 
 * Características:
 * - Vista previa tipo galería swipeable
 * - Botón para eliminar imágenes individuales
 * - Indicador de posición actual
 * - Navegación fluida
 */
export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onRemoveImage,
  onSelectImage,
  currentIndex,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  // Cuando el usuario hace scroll en la galería
  const handleMomentumScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setActiveIndex(index);
    onSelectImage(index);
  };

  const renderImageItem = ({ item, index }: { item: ImageItem; index: number }) => (
    <View style={styles.slideContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} />

      {/* Botón eliminar en la esquina superior derecha */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            '¿Eliminar imagen?',
            'Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => onRemoveImage(item.id),
              },
            ],
          );
        }}
      >
        <Ionicons name="close-circle-outline" size={32} color="#FF6B6B" />
      </TouchableOpacity>

      {/* Número de imagen en la esquina inferior */}
      <View style={styles.imageCounter}>
        <Text style={styles.imageCounterText}>
          {index + 1} / {images.length}
        </Text>
      </View>
    </View>
  );

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>No hay imágenes seleccionadas</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Carrusel */}
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />

      {/* Indicador de puntos */}
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: activeIndex === index ? '#FF6B6B' : '#ccc' },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  slideContainer: {
    width,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '95%',
    height: '95%',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});
