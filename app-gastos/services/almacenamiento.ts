/**
 * Servicio de Almacenamiento Persistente
 * Envuelve AsyncStorage para facilitar lectura y escritura
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

class ServicioAlmacenamiento {
  private esWeb = Platform.OS === 'web';

  /**
   * Guardar valor (string o JSON)
   */
  async guardar(clave: string, valor: any): Promise<void> {
    try {
      const valorGuardar =
        typeof valor === 'string' ? valor : JSON.stringify(valor);
      
      if (this.esWeb) {
        localStorage.setItem(clave, valorGuardar);
      } else {
        await SecureStore.setItemAsync(clave, valorGuardar);
      }
    } catch (error) {
      console.error(`Error guardando ${clave}:`, error);
    }
  }

  /**
   * Obtener valor como string
   */
  async obtenerString(clave: string): Promise<string | null> {
    try {
      if (this.esWeb) {
        return localStorage.getItem(clave);
      } else {
        return await SecureStore.getItemAsync(clave);
      }
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
      const valor = await this.obtenerString(clave);
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
      if (this.esWeb) {
        localStorage.removeItem(clave);
      } else {
        await SecureStore.deleteItemAsync(clave);
      }
    } catch (error) {
      console.error(`Error eliminando ${clave}:`, error);
    }
  }

  /**
   * Limpiar todo el almacenamiento
   */
  async limpiarTodo(): Promise<void> {
    try {
      if (this.esWeb) {
        localStorage.clear();
      } else {
        // SecureStore no tiene clear() directo para todas las llaves, 
        // habria que borrarlas una por una o usar otra estrategia
        console.warn('SecureStore clear not fully supported natively');
      }
    } catch (error) {
      console.error('Error limpiando almacenamiento:', error);
    }
  }
}

export const servicioAlmacenamiento = new ServicioAlmacenamiento();
