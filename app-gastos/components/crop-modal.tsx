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
import { COLORES, RADIO, SOMBRAS } from '@/constants/colores';

interface CropModalProps {
  visible: boolean;
  imageUri: string;
  onCropComplete: (croppedBase64: string) => void;
  onCancel: () => void;
}

const { width, height } = Dimensions.get('window');
const IMAGE_MAX_WIDTH = width * 0.85;

export const CropModal: React.FC<CropModalProps> = ({
  visible,
  imageUri,
  onCropComplete,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [cropValues, setCropValues] = useState({
    left: 20,
    top: 20,
    width: IMAGE_MAX_WIDTH - 40,
    height: 400 - 40,
  });

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
        Alert.alert('Exito', 'Imagen recortada y lista para procesar.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo recortar la imagen. Intenta nuevamente.');
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
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="chevron-back" size={28} color={COLORES.blanco} />
          </TouchableOpacity>
          <Text style={styles.title}>Recortar Imagen</Text>
          <View style={{ width: 28 }} />
        </View>

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

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Desliza los controles para ajustar el area de recorte
          </Text>
        </View>

        <View style={styles.controlsContainer}>
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
                <Ionicons name="remove-circle" size={24} color={COLORES.error} />
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
                <Ionicons name="add-circle" size={24} color={COLORES.exito} />
              </TouchableOpacity>
            </View>
          </View>

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
                <Ionicons name="remove-circle" size={24} color={COLORES.error} />
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
                <Ionicons name="add-circle" size={24} color={COLORES.exito} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, SOMBRAS.leve]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.confirmButton, SOMBRAS.leve]}
            onPress={handleCrop}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORES.blanco} />
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
    backgroundColor: COLORES.fondoOscuro,
  },
  header: {
    backgroundColor: COLORES.error,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: COLORES.blanco,
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
    borderColor: COLORES.error,
    borderRadius: RADIO.grande,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: COLORES.grisClaro,
  },
  cropOverlay: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: COLORES.exito,
  },
  cropBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORES.exito,
    borderStyle: 'dashed',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  infoText: {
    color: COLORES.error,
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
    color: COLORES.blanco,
    fontSize: 13,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: RADIO.mediano,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sliderValue: {
    color: COLORES.blanco,
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
    borderRadius: RADIO.mediano,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORES.textoMedio,
  },
  confirmButton: {
    backgroundColor: COLORES.error,
  },
  buttonText: {
    color: COLORES.blanco,
    fontSize: 16,
    fontWeight: '600',
  },
});
