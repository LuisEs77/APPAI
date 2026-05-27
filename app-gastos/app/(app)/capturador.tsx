import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, ESPACIADO, TIPOGRAFIA, SOMBRAS, RADIO } from '@/constants/colores';
import { useHaptics } from '@/hooks/use-haptics';

import { ImageCarousel } from '@/components/image-carousel';
import { CropModal } from '@/components/crop-modal';
import { ProcessingStatus } from '@/components/processing-status';
import gastosService from '@/services/gastos.service';

interface ImageItem {
  uri: string;
  base64: string;
  id: string;
}

export default function CapturadorScreen() {
  const router = useRouter();
  const haptics = useHaptics();
  
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [cropModalVisible, setCropModalVisible] = useState(false);
  
  const [processingVisible, setProcessingVisible] = useState(false);
  const [processingState, setProcessingState] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    duplicates: 0,
    errors: 0,
    isLoading: false,
    errorDetails: [] as {index: number, error: any}[],
  });

  const tomarFoto = async () => {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu camara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].base64) {
      const newImage: ImageItem = {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        id: uuid.v4().toString(),
      };
      setImages([...images, newImage]);
      setCurrentIndex(images.length);
    }
  };

  const seleccionarDelGaleria = async () => {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets
        .filter(asset => asset.base64)
        .map(asset => ({
          uri: asset.uri,
          base64: asset.base64!,
          id: uuid.v4().toString(),
        }));
      setImages([...images, ...newImages]);
      setCurrentIndex(images.length);
    }
  };

  const abrirRecortador = () => {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
    if (images.length === 0) return;
    setCropModalVisible(true);
  };

  const handleCropComplete = (croppedBase64: string) => {
    const updatedImages = [...images];
    updatedImages[currentIndex] = {
      ...updatedImages[currentIndex],
      base64: croppedBase64,
      uri: `data:image/jpeg;base64,${croppedBase64}`, 
    };
    setImages(updatedImages);
    setCropModalVisible(false);
    haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
  };

  const procesarTodasLasImagenes = async () => {
    if (images.length === 0) {
      Alert.alert('Info', 'No hay imagenes para procesar.');
      return;
    }

    haptics.impactAsync(haptics.ImpactFeedbackStyle.Heavy);
    setProcessingState({
      total: images.length,
      processed: 0,
      successful: 0,
      duplicates: 0,
      errors: 0,
      isLoading: true,
      errorDetails: [],
    });
    setProcessingVisible(true);

    try {
      const bases64 = images.map(img => img.base64);
      const resultado = await gastosService.procesarMultiplesFacturas(bases64);

      setProcessingState({
        total: resultado.resumen?.total_procesados || images.length,
        processed: resultado.resumen?.total_procesados || images.length,
        successful: resultado.resumen?.total_exitosos || resultado.exitosos?.length || 0,
        duplicates: resultado.resumen?.total_duplicados || resultado.duplicados?.length || 0,
        errors: resultado.resumen?.total_errores || resultado.errores?.length || 0,
        isLoading: false,
        errorDetails: resultado.errores || [],
      });
      
      if ((resultado.resumen?.total_exitosos || 0) > 0) {
         setImages([]);
         setCurrentIndex(0);
         haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      } else {
         haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      setProcessingState(prev => ({
        ...prev,
        isLoading: false,
        errorDetails: [{ index: 0, error: error.message }],
      }));
      haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.backBoton}>
          <Ionicons name="close" size={28} color={COLORES.textoOscuro} />
        </TouchableOpacity>
        <Text style={estilos.titulo}>Nueva Factura</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={estilos.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={estilos.instrucciones}>
          <Text style={estilos.instruccionTexto}>
            Captura o sube tus facturas. La IA extraerá los datos automáticamente.
          </Text>
        </View>

        <View style={estilos.carouselContainer}>
          <ImageCarousel
            images={images}
            currentIndex={currentIndex}
            onSelectImage={setCurrentIndex}
            onRemoveImage={(id) => {
              const newImages = images.filter(img => img.id !== id);
              setImages(newImages);
              if (currentIndex >= newImages.length) {
                setCurrentIndex(Math.max(0, newImages.length - 1));
              }
              haptics.impactAsync(haptics.ImpactFeedbackStyle.Light);
            }}
          />
        </View>

        <View style={estilos.botonesContainer}>
        <View style={estilos.filaBotones}>
          <TouchableOpacity style={[estilos.botonAccion, SOMBRAS.media]} onPress={tomarFoto}>
            <Ionicons name="camera" size={24} color={COLORES.blanco} />
            <Text style={estilos.botonTexto}>Tomar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[estilos.botonAccion, { backgroundColor: COLORES.grisClaro }, SOMBRAS.leve]} onPress={seleccionarDelGaleria}>
            <Ionicons name="images" size={24} color={COLORES.acento} />
            <Text style={[estilos.botonTexto, { color: COLORES.acento }]}>Galería</Text>
          </TouchableOpacity>
        </View>

        {images.length > 0 && (
          <View style={estilos.accionesProcesamiento}>
            <TouchableOpacity style={estilos.botonSecundario} onPress={abrirRecortador}>
              <Ionicons name="crop" size={20} color={COLORES.acento} />
              <Text style={estilos.botonSecundarioTexto}>Recortar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[estilos.botonProcesar, SOMBRAS.profunda]} onPress={procesarTodasLasImagenes}>
              <Ionicons name="checkmark-circle" size={24} color={COLORES.blanco} />
              <Text style={estilos.botonProcesarTexto}>Procesar ({images.length})</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {images.length > 0 && (
        <CropModal
          visible={cropModalVisible}
          imageUri={images[currentIndex]?.uri}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropModalVisible(false)}
        />
      )}

      </ScrollView>

      <ProcessingStatus
        visible={processingVisible}
        state={processingState}
        onDismiss={() => {
          setProcessingVisible(false);
          if (processingState.successful > 0 && processingState.total === processingState.successful) {
            router.replace('/inicio' as any);
          }
        }}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondoSecundario,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: ESPACIADO.lg,
  },
  carouselContainer: {
    paddingHorizontal: ESPACIADO.lg,
    marginVertical: ESPACIADO.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ESPACIADO.lg,
    paddingVertical: ESPACIADO.md,
  },
  backBoton: {
    padding: ESPACIADO.xs,
  },
  titulo: {
    fontSize: TIPOGRAFIA.tamanios.xl,
    fontWeight: '700',
    color: COLORES.negro,
  },
  instrucciones: {
    paddingHorizontal: ESPACIADO.lg,
    paddingBottom: ESPACIADO.md,
  },
  instruccionTexto: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.textoMedio,
    textAlign: 'center',
    lineHeight: 20,
  },
  botonesContainer: {
    paddingHorizontal: ESPACIADO.lg,
    paddingBottom: ESPACIADO.xl,
    gap: ESPACIADO.md,
  },
  filaBotones: {
    flexDirection: 'row',
    gap: ESPACIADO.md,
  },
  botonAccion: {
    flex: 1,
    backgroundColor: COLORES.acento,
    paddingVertical: ESPACIADO.md,
    borderRadius: RADIO.grande,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  botonTexto: {
    color: COLORES.blanco,
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '700',
  },
  accionesProcesamiento: {
    gap: ESPACIADO.sm,
    marginTop: ESPACIADO.xs,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    paddingVertical: ESPACIADO.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  botonSecundarioTexto: {
    color: COLORES.acento,
    fontSize: TIPOGRAFIA.tamanios.sm,
    fontWeight: '600',
  },
  botonProcesar: {
    backgroundColor: COLORES.exito,
    paddingVertical: ESPACIADO.lg,
    borderRadius: RADIO.grande,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  botonProcesarTexto: {
    color: COLORES.blanco,
    fontSize: TIPOGRAFIA.tamanios.lg,
    fontWeight: '800',
  },
});
