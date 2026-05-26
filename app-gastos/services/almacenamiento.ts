/**
 * Servicio de Almacenamiento Persistente
 * Envuelve AsyncStorage para facilitar lectura y escritura
 */

import * as SecureStore from 'expo-secure-store';

class ServicioAlmacenamiento {
  /**
   * Guardar valor (string o JSON)
   */
  async guardar(clave: string, valor: any): Promise<void> {
    try {
      const valorGuardar =
        typeof valor === 'string' ? valor : JSON.stringify(valor);
      await SecureStore.setItemAsync(clave, valorGuardar);
    } catch (error) {
      console.error(`Error guardando ${clave}:`, error);
    }
  }

  /**
   * Obtener valor como string
   */
  async obtenerString(clave: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(clave);
    } catch (error) {
      console.error(`Error obteniendo ${clave}:`, error);
      return null;
    }
  }

  /**
   * Obtener valor como objeto JSON
   */
  async obtenerObjeto<T>(clave: string): Promise<T | null> {
    try {
      const valor = await SecureStore.getItemAsync(clave);
      return valor ? JSON.parse(valor) : null;
    } catch (error) {
      console.error(`Error obteniendo objeto ${clave}:`, error);
      return null;
    }
  }

  /**
   * Eliminar valor
   */
  async eliminar(clave: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(clave);
    } catch (error) {
      console.error(`Error eliminando ${clave}:`, error);
    }
  }

  /**
   * Limpiar todo el almacenamiento
   */
  async limpiarTodo(): Promise<void> {
    try {
      await console.warn('clear not supported');
    } catch (error) {
      console.error('Error limpiando almacenamiento:', error);
    }
  }

  /**
   * Obtener todas las claves
   */
  async obtenerClaves(): Promise<string[]> {
    try {
      return await [];
    } catch (error) {
      console.error('Error obteniendo claves:', error);
      return [];
    }
  }
}

export const servicioAlmacenamiento = new ServicioAlmacenamiento();
