import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

import { useAutenticacion } from '@/hooks/use-autenticacion';
import { EmailModal } from '@/components/auth/email-modal';
import { useHaptics } from '@/hooks/use-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, ESPACIADO, TIPOGRAFIA, RADIO, SOMBRAS } from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';

export default function PerfilScreen() {
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const { usuario, cerrarSesion } = useAutenticacion();
  const haptics = useHaptics();

  

  const handleCerrarSesion = async () => {
    haptics.notificationAsync(haptics.NotificationFeedbackType.Warning);
    await cerrarSesion();
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        {/* Header de Perfil */}
        <View style={estilos.headerPerfil}>
          <View style={estilos.avatarContenedor}>
            <Text style={estilos.avatarTexto}>
              {usuario?.nombre?.charAt(0) || 'U'}
            </Text>
            <TouchableOpacity style={estilos.botonEditAvatar}>
              <Ionicons name="camera" size={16} color={COLORES.negro} />
            </TouchableOpacity>
          </View>
          <Text style={estilos.nombreCompleto}>{usuario?.nombre} {usuario?.apellido || ''}</Text>
          <Text style={estilos.email}>{usuario?.email}</Text>
        </View>



        {/* Sección de Información */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Mi Cuenta</Text>
          <View style={estilos.cardInfo}>
            <View style={estilos.itemInfo}>
              <Ionicons name="person-outline" size={20} color={COLORES.acento} />
              <View style={estilos.textoItem}>
                <Text style={estilos.labelItem}>Nombre</Text>
                <Text style={estilos.valorItem}>{usuario?.nombre}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[estilos.itemInfo, estilos.borderTop]}
              onPress={() => setEmailModalVisible(true)}
            >
              <Ionicons name="mail-outline" size={20} color={COLORES.acento} />
              <View style={estilos.textoItem}>
                <Text style={estilos.labelItem}>Correo Electrónico</Text>
                <Text style={estilos.valorItem}>{usuario?.email}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección de Ajustes */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Ajustes</Text>
          <View style={estilos.cardInfo}>
            <TouchableOpacity style={estilos.itemInfo} onPress={() => haptics.selectionAsync()}>
              <Ionicons name="notifications-outline" size={20} color={COLORES.azulOscuro} />
              <Text style={estilos.textoAjuste}>Notificaciones</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORES.textoClaro} />
            </TouchableOpacity>
            <TouchableOpacity style={[estilos.itemInfo, estilos.borderTop]} onPress={() => haptics.selectionAsync()}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORES.azulOscuro} />
              <Text style={estilos.textoAjuste}>Seguridad</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORES.textoClaro} />
            </TouchableOpacity>
          </View>

        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity style={estilos.botonCerrar} onPress={handleCerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color={COLORES.error} />
          <Text style={estilos.textoBotonCerrar}>{TEXTOS.cerrarSesion}</Text>
        </TouchableOpacity>
        
        <Text style={estilos.version}>Versión 1.0.0 (APPAI)</Text>
      </ScrollView>
      <EmailModal visible={emailModalVisible} onClose={() => setEmailModalVisible(false)} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondoSecundario,
  },
  contenido: {
    padding: ESPACIADO.lg,
    paddingBottom: ESPACIADO.xxl,
  },
  headerPerfil: {
    alignItems: 'center',
    marginTop: ESPACIADO.xl,
    marginBottom: ESPACIADO.xxl,
  },
  avatarContenedor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORES.grisOscuro2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ESPACIADO.md,
    ...SOMBRAS.media,
  },
  avatarTexto: {
    fontSize: 42,
    color: COLORES.blanco,
    fontWeight: '800',
  },
  botonEditAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORES.acento,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORES.blanco,
  },
  nombreCompleto: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORES.textoOscuro,
    marginBottom: 4,
  },
  email: {
    fontSize: TIPOGRAFIA.tamanios.base,
    color: COLORES.textoMedio,
  },
  seccion: {
    marginBottom: ESPACIADO.xl,
  },
  tituloSeccion: {
    fontSize: TIPOGRAFIA.tamanios.sm,
    fontWeight: '700',
    color: COLORES.textoMedio,
    textTransform: 'uppercase',
    marginBottom: ESPACIADO.sm,
    marginLeft: ESPACIADO.xs,
  },
  cardInfo: {
    backgroundColor: COLORES.blanco,
    borderRadius: RADIO.grande,
    overflow: 'hidden',
    ...SOMBRAS.leve,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACIADO.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: COLORES.grisClaro,
  },
  textoItem: {
    marginLeft: ESPACIADO.md,
  },
  labelItem: {
    fontSize: 10,
    color: COLORES.textoClaro,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  valorItem: {
    fontSize: TIPOGRAFIA.tamanios.base,
    color: COLORES.textoOscuro,
    fontWeight: '600',
  },
  textoAjuste: {
    flex: 1,
    marginLeft: ESPACIADO.md,
    fontSize: TIPOGRAFIA.tamanios.base,
    color: COLORES.textoOscuro,
    fontWeight: '500',
  },
  botonCerrar: {
    flexDirection: 'row',
    backgroundColor: COLORES.blanco,
    paddingVertical: ESPACIADO.md,
    borderRadius: RADIO.grande,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ESPACIADO.lg,
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.2)',
    gap: 8,
  },
  textoBotonCerrar: {
    color: COLORES.error,
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '700',
  },
  cta: {
    marginVertical: ESPACIADO.md,
    backgroundColor: COLORES.acento,
    paddingVertical: ESPACIADO.md,
    borderRadius: RADIO.completo,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.media,
  },
  ctaText: {
    color: COLORES.negro,
    fontSize: TIPOGRAFIA.tamanios.base,
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
    marginTop: ESPACIADO.xxl,
    color: COLORES.textoPlaceholder,
    fontSize: 12,
  },
});
