import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { COLORES } from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';
import { MenuLateral } from '@/components/drawer/menu-lateral';

/**
 * Layout para rutas autenticadas
 * Usa Drawer Navigator (menu lateral) como navegacion principal
 */
export default function AppLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORES.azulOscuro,
        },
        headerTintColor: COLORES.blanco,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        drawerStyle: {
          backgroundColor: COLORES.blanco,
          width: 280,
        },
        drawerLabelStyle: {
          color: COLORES.textoOscuro,
          fontSize: 14,
          fontWeight: '500',
          marginLeft: -16,
        },
        drawerActiveTintColor: COLORES.azulClaro,
        drawerInactiveTintColor: COLORES.textoMedio,
      }}
      drawerContent={(props) => <MenuLateral {...props} />}
    >
      <Drawer.Screen
        name="inicio"
        options={{
          headerTitle: TEXTOS.misgastos,
          drawerLabel: TEXTOS.inicio,
        }}
      />
      <Drawer.Screen
        name="historial"
        options={{
          headerTitle: TEXTOS.historial,
          drawerLabel: TEXTOS.historial,
        }}
      />
      <Drawer.Screen
        name="perfil"
        options={{
          headerTitle: TEXTOS.perfil,
          drawerLabel: TEXTOS.perfil,
        }}
      />
      <Drawer.Screen
        name="configuracion"
        options={{
          headerTitle: TEXTOS.configuracion,
          drawerLabel: TEXTOS.configuracion,
        }}
      />
      <Drawer.Screen
        name="capturador"
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}
