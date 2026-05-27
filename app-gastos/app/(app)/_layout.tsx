import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, TIPOGRAFIA, SOMBRAS, ESPACIADO, RADIO } from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';

/**
 * Layout para rutas autenticadas
 * Tabs Navigator moderno y amigable
 */
export default function AppLayout() {
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(3);

  const notificationBadgeStyle = StyleSheet.create({
    badge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: COLORES.error,
      borderRadius: RADIO.completo,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: ESPACIADO.xs,
      borderWidth: 2,
      borderColor: COLORES.blanco,
      ...SOMBRAS.media,
    },
    badgeText: {
      color: COLORES.blanco,
      fontSize: TIPOGRAFIA.tamanios.xs,
      fontWeight: TIPOGRAFIA.pesos.bold,
    },
  });

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORES.blanco,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: COLORES.grisClaro3,
        },
        headerTintColor: COLORES.negro,
        headerTitleStyle: {
          fontWeight: TIPOGRAFIA.pesos.bold,
          fontSize: TIPOGRAFIA.tamanios.lg,
          color: COLORES.textoOscuro,
        },
        headerRight: () => (
          <Pressable
            onPress={() => console.log('Abrir notificaciones')}
            style={{ paddingRight: ESPACIADO.lg, position: 'relative' }}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORES.negro} />
            {notificacionesNoLeidas > 0 && (
              <View style={notificationBadgeStyle.badge}>
                <Text style={notificationBadgeStyle.badgeText}>
                  {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                </Text>
              </View>
            )}
          </Pressable>
        ),
        tabBarStyle: {
          backgroundColor: COLORES.blanco,
          borderTopWidth: 1,
          borderTopColor: COLORES.grisClaro3,
          height: Platform.OS === 'ios' ? 80 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: COLORES.negro,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: COLORES.acento,
        tabBarInactiveTintColor: COLORES.grisOscuro,
        tabBarLabelStyle: {
          display: 'none', // Ocultar etiquetas
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          headerTitle: 'APPAI',
          tabBarLabel: TEXTOS.inicio,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          headerTitle: TEXTOS.historial,
          tabBarLabel: TEXTOS.historial,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="capturador"
        options={{
          headerTitle: 'Capturar Factura',
          tabBarLabel: '',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: COLORES.acento,
              width: 56,
              height: 56,
              borderRadius: RADIO.completo,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Platform.OS === 'ios' ? 10 : 2,
              elevation: 6,
              shadowColor: COLORES.acento,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}>
              <Ionicons name="camera" size={28} color={COLORES.negro} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          headerTitle: TEXTOS.perfil,
          tabBarLabel: TEXTOS.perfil,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      
      {/* Rutas ocultas en la barra de pestañas */}
      <Tabs.Screen
        name="configuracion"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
