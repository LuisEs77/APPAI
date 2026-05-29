import React, { useEffect } from 'react';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { ProveedorAutenticacion } from '@/context/auth-context';
import 'react-native-reanimated';

/**
 * Layout raíz que maneja la navegacion entre rutas autenticadas y no autenticadas
 */
function RootLayoutContent() {
  const { usuario, cargando, restaurarSesion } = useAutenticacion();
  const router = useRouter();

  useEffect(() => {
    // Restaurar sesión al iniciar la app
    restaurarSesion();
  }, []);

  useEffect(() => {
    // Si ya terminó de restaurar y no hay usuario, forzar ruta de auth en web
    if (!cargando && !usuario) {
      try {
        const path = typeof window !== 'undefined' ? window.location.pathname : null;
        const authPaths = ['/iniciar-sesion', '/crear-cuenta', '/olvido-password'];
        const isAuthPath = path ? authPaths.some((p) => path.includes(p)) : false;

        if (path && !isAuthPath) {
          // Reemplazar la URL actual por la pantalla de login
          router.replace('/(auth)/iniciar-sesion' as any);
        }
      } catch (err) {
        // No bloquear si falla en entornos nativos
        // console.warn('Redirect to auth failed', err);
      }
    }
  }, [cargando, usuario, router]);

  // La navegación se decide en el render según `usuario`

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
