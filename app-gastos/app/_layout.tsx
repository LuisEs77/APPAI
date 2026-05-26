import React, { useEffect } from 'react';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { ProveedorAutenticacion } from '@/context/auth-context';
import 'react-native-reanimated';

/**
 * Layout raíz que maneja la navegacion entre rutas autenticadas y no autenticadas
 */
function RootLayoutContent() {
  const { usuario, cargando, restaurarSesion } = useAutenticacion();

  useEffect(() => {
    // Restaurar sesión al iniciar la app
    restaurarSesion();
  }, []);

  if (cargando) {
    // Mostrar splash screen mientras se carga
    return <Stack />;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        {usuario ? (
          // Rutas autenticadas (app)
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        ) : (
          // Rutas no autenticadas (auth)
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

/**
 * Componente principal que envuelve con el proveedor de autenticación
 */
export default function RootLayout() {
  return (
    <ProveedorAutenticacion>
      <RootLayoutContent />
    </ProveedorAutenticacion>
  );
}
