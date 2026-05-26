/**
 * DTO para respuesta de autenticacion exitosa
 * Contiene el JWT y datos del usuario
 */
export class TokenDto {
  accessToken: string;
  tipo: string; // 'Bearer'
  expiresIn: string; // '7d'
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
  };
}
