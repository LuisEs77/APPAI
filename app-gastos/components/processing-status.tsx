import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, RADIO, SOMBRAS } from '@/constants/colores';

interface ProcessingState {
  total: number;
  processed: number;
  successful: number;
  duplicates: number;
  errors: number;
  isLoading: boolean;
  errorDetails?: any;
}

interface ProcessingStatusProps {
  visible: boolean;
  state: ProcessingState;
  onDismiss: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  visible,
  state,
  onDismiss,
}) => {
  const progressPercentage = state.total > 0 ? (state.processed / state.total) * 100 : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, SOMBRAS.profunda]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Procesando Recibos</Text>
          </View>

          {/* Progreso */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {state.processed} de {state.total} procesadas
            </Text>
          </View>

          {/* Loading Spinner */}
          {state.isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORES.azulClaro} />
              <Text style={styles.loadingText}>
                Enviando imagenes al servidor...
              </Text>
            </View>
          )}

          {/* Resultados */}
          {!state.isLoading && (
            <ScrollView style={styles.resultsContainer}>
              {/* Exitosas */}
              <View style={[styles.resultRow, styles.successRow]}>
                <View style={styles.iconContainer}>
                  <Ionicons name="checkmark-circle" size={28} color={COLORES.exito} />
                </View>
                <View style={styles.resultContent}>
                  <Text style={styles.resultLabel}>Registradas Exitosamente</Text>
                  <Text style={styles.resultCount}>{state.successful}</Text>
                </View>
              </View>

              {/* Duplicadas */}
              {state.duplicates > 0 && (
                <View style={[styles.resultRow, styles.warningRow]}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="alert-circle"
                      size={28}
                      color={COLORES.advertencia}
                    />
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultLabel}>Duplicadas (No procesadas)</Text>
                    <Text style={styles.resultCount}>{state.duplicates}</Text>
                  </View>
                </View>
              )}

              {/* Errores */}
              {state.errors > 0 && (
                <View style={[styles.resultRow, styles.errorRow]}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="close-circle"
                      size={28}
                      color={COLORES.error}
                    />
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultLabel}>Errores</Text>
                    <Text style={styles.resultCount}>{state.errors}</Text>
                  </View>
                </View>
              )}

              {/* Detalles de errores si existen */}
              {state.errorDetails && state.errorDetails.length > 0 && (
                <View style={styles.errorDetailsContainer}>
                  <Text style={styles.errorDetailsTitle}>Detalles de Errores:</Text>
                  {state.errorDetails.map((error: any, index: number) => (
                    <View key={index} style={styles.errorDetailItem}>
                      <Text style={styles.errorDetailText}>
                        - Imagen {error.index + 1}: {error.error}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          {/* Boton Cerrar */}
          {!state.isLoading && (
            <TouchableOpacity
              style={[styles.closeButton, SOMBRAS.leve]}
              onPress={onDismiss}
            >
              <Text style={styles.closeButtonText}>Entendido</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: COLORES.blanco,
    borderRadius: RADIO.grande,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORES.azulClaro,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORES.blanco,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORES.grisClaro,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORES.azulClaro,
  },
  progressText: {
    fontSize: 13,
    color: COLORES.textoMedio,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORES.textoMedio,
    textAlign: 'center',
  },
  resultsContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: RADIO.mediano,
    alignItems: 'center',
  },
  successRow: {
    backgroundColor: '#E8F5E9',
  },
  warningRow: {
    backgroundColor: '#FFF3E0',
  },
  errorRow: {
    backgroundColor: '#FFEBEE',
  },
  iconContainer: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 13,
    color: COLORES.textoMedio,
    marginBottom: 4,
  },
  resultCount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORES.textoOscuro,
  },
  errorDetailsContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIO.mediano,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  errorDetailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.error,
    marginBottom: 8,
  },
  errorDetailItem: {
    marginBottom: 6,
  },
  errorDetailText: {
    fontSize: 12,
    color: COLORES.error,
  },
  closeButton: {
    backgroundColor: COLORES.azulOscuro,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: RADIO.mediano,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORES.blanco,
    fontSize: 16,
    fontWeight: '600',
  },
});
