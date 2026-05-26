import React from 'react';
import { Stack } from 'expo-router';

/**
 * Layout para rutas no autenticadas
 * Agrupa pantallas de login, registro, etc.
 */
export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="iniciar-sesion"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="crear-cuenta"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="olvido-password"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
