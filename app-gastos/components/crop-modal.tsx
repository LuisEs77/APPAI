import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';

interface CropModalProps {
  visible: boolean;
  imageUri: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');
const IMAGE_MAX_WIDTH = width * 0.85;

/**
 * Modal de Recorte de Imágenes
 * 
 * Funcionalidades:
 * - Vista previa de la imagen
 * - Deslizadores para controlar el área de recorte (izq, der, arriba, abajo)
 * - Previsualización del recorte
 * - Botones para confirmar o cancelar
 * 
 * Nota: Expo-image-manipulator maneja el recorte a nivel nativo
 */
export const CropModal: React.FC<CropModalProps> = ({
  visible,
  imageUri,
  onCropComplete,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  // Valores de recorte en píxeles (porcentaje del ancho/alto)
  const [cropValues, setCropValues] = useState({
    left: 20,   // píxeles desde la izquierda
    top: 20,    // píxeles desde arriba
    width: IMAGE_MAX_WIDTH - 40,  // ancho del recorte
    height: 400 - 40, // alto del recorte
  });

  // Obtener dimensiones de la imagen
  const [imageDimensions, setImageDimensions] = useState({
    width: IMAGE_MAX_WIDTH,
    height: 400,
  });

  const handleImageLoad = (event: any) => {
    const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
    const aspectRatio = imgWidth / imgHeight;
    const maxWidth = IMAGE_MAX_WIDTH;
    const maxHeight = maxWidth / aspectRatio;

    setImageDimensions({
      width: maxWidth,
      height: Math.min(maxHeight, height * 0.6),
    });
  };

  const handleCrop = async () => {
    setLoading(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, cropValues.left),
              originY: Math.max(0, cropValues.top),
              width: Math.max(100, cropValues.width),
              height: Math.max(100, cropValues.height),
            },
          },
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      );

      if (result.base64) {
        onCropComplete(result.base64);
        Alert.alert('✅ Éxito', 'Imagen recortada y lista para procesar.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo recortar la imagen. Intenta nuevamente.');
      console.error('Crop error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Recortar Imagen</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Área de Previsualización */}
        <View style={styles.previewContainer}>
          <View
            style={[
              styles.imageBorder,
              {
                width: imageDimensions.width,
                height: imageDimensions.height,
              },
            ]}
          >
            <Image
              source={{ uri: imageUri }}
              style={[
                styles.image,
                {
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                },
              ]}
              onLoad={handleImageLoad}
            />

            {/* Overlay del recorte - muestra dónde será recortado */}
            <View
              style={[
                styles.cropOverlay,
                {
                  left: cropValues.left,
                  top: cropValues.top,
                  width: cropValues.width,
                  height: cropValues.height,
                },
              ]}
            >
              <View style={styles.cropBorder} />
            </View>
          </View>
        </View>

        {/* Información */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            👇 Desliza los controles para ajustar el área de recorte
          </Text>
        </View>

        {/* Controles (Sliders simplificados) */}
        <View style={styles.controlsContainer}>
          {/* Control de izquierda/derecha */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Izquierda</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                onPress={() =>
                  setCropValues({
                    ...cropValues,
                    left: Math.max(0, cropValues.left - 10),
                  })
                }
              >
                <Ionicons name="remove-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{cropValues.left}px</Text>
              <TouchableOpacity
                onPress={() =>
                  setCropValues({
                    ...cropValues,
                    left: Math.min(imageDimensions.width - 100, cropValues.left + 10),
                  })
                }
              >
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Control de arriba/abajo */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Arriba</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                onPress={() =>
                  setCropValues({
                    ...cropValues,
                    top: Math.max(0, cropValues.top - 10),
                  })
                }
              >
                <Ionicons name="remove-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{cropValues.top}px</Text>
              <TouchableOpacity
                onPress={() =>
                  setCropValues({
                    ...cropValues,
                    top: Math.min(imageDimensions.height - 100, cropValues.top + 10),
                  })
                }
              >
                <Ionicons name="add-circle" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={handleCrop}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Recortar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageBorder: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: '#f0f0f0',
  },
  cropOverlay: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  cropBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  infoText: {
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  controlGroup: {
    gap: 8,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sliderValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
