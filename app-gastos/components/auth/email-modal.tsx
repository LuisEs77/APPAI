import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { InputSeguro } from './input-seguro';
import { BotonPrimario } from '../comunes/boton-primario';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { useHaptics } from '@/hooks/use-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, ESPACIADO, TIPOGRAFIA, RADIO, SOMBRAS } from '@/constants/colores';

interface EmailModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ visible, onClose }) => {
  const { usuario, actualizarUsuario } = useAutenticacion() as any;
  const haptics = useHaptics();
  const [email, setEmail] = useState(usuario?.email || '');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(usuario?.email || '');
  }, [usuario, visible]);

  const validarEmail = (valor: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  };

  const handleGuardar = async () => {
    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!validarEmail(email)) {
      setError('El email no es valido');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);
      await actualizarUsuario({ email });
      try {
        // feedback
        haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      } catch {}
      Alert.alert('Listo', 'Email actualizado');
      onClose();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVincularGoogle = () => {
    Alert.alert(
      'Vincular con Google',
      'Esta acción abrirá la página de Google para iniciar sesión. La integración completa de OAuth requiere configuración adicional.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: async () => {
            const url = 'https://accounts.google.com/signin';
            try {
              await Linking.openURL(url);
            } catch (err) {
              Alert.alert('Error', 'No se pudo abrir la URL.');
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.fondo}>
        <View style={styles.contenedor}>
          <TouchableOpacity style={styles.cerrar} onPress={onClose}>
            <Ionicons name="close" size={20} color={COLORES.textoOscuro} />
          </TouchableOpacity>

          <Text style={styles.titulo}>Correo Electrónico</Text>
          <Text style={styles.subtitulo}>Agrega o vincula tu correo con Google</Text>

          <InputSeguro
            label="Correo"
            placeholder="correo@ejemplo.com"
            valor={email}
            onChangeText={(t) => setEmail(t)}
            tipoTeclado="email-address"
            error={error}
          />

          <BotonPrimario texto="Guardar" onPress={handleGuardar} cargando={loading} />

          <TouchableOpacity style={styles.googleBtn} onPress={handleVincularGoogle}>
            <Ionicons name="logo-google" size={18} color={COLORES.acento} style={styles.googleIcon} />
            <Text style={styles.googleText}>Vincular con Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ESPACIADO.lg,
  },
  contenedor: {
    width: '100%',
    backgroundColor: COLORES.blanco,
    borderRadius: RADIO.grande,
    padding: ESPACIADO.lg,
    ...SOMBRAS.media,
  },
  cerrar: {
    position: 'absolute',
    right: ESPACIADO.md,
    top: ESPACIADO.md,
    zIndex: 10,
  },
  titulo: {
    fontSize: TIPOGRAFIA.tamanios.lg,
    fontWeight: '700',
    color: COLORES.textoOscuro,
    marginBottom: ESPACIADO.xs,
  },
  subtitulo: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    color: COLORES.textoMedio,
    marginBottom: ESPACIADO.md,
  },
  googleBtn: {
    marginTop: ESPACIADO.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ESPACIADO.sm,
  },
  googleIcon: {
    marginRight: ESPACIADO.xs,
  },
  googleText: {
    color: COLORES.acento,
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: TIPOGRAFIA.pesos.semibold as any,
  },
});
