/**
 * Hook useAutenticacion
 * Proporciona acceso facil al contexto de autenticacion
 */

import { useContext } from 'react';
import {
  ContextoAutenticacionReact,
  ContextoAutenticacionDefault,
} from '../context/auth-context';

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacionReact);
  
  if (!contexto) {
    return ContextoAutenticacionDefault;
  }
  
  return contexto;
};
