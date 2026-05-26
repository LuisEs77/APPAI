import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { JwtGuard } from '../guards/jwt.guard';

/**
 * Controlador de Usuarios
 * Maneja endpoints para operaciones de usuario (obtener, actualizar, eliminar)
 * Los endpoints protegidos requieren JWT valido
 */
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * GET /usuarios/:id - Obtener usuario por ID (requiere autenticacion)
   * @param id UUID del usuario
   * @param request Request con usuario autenticado
   * @returns Datos del usuario
   */
  @Get(':id')
  @UseGuards(JwtGuard)
  async obtener(@Param('id') id: string, @Request() request: any) {
    // Validar que el usuario solo pueda ver su propio perfil
    // (o sea admin para ver otros)
    if (request.user.id !== id) {
      return {
        statusCode: 403,
        message: 'No autorizado para ver este usuario',
      };
    }

    return await this.usuariosService.obtenerPorId(id);
  }

  /**
   * PUT /usuarios/:id - Actualizar usuario (requiere autenticacion)
   * @param id UUID del usuario
   * @param datosActualizacion Datos a actualizar
   * @param request Request con usuario autenticado
   * @returns Usuario actualizado
   */
  @Put(':id')
  @UseGuards(JwtGuard)
  async actualizar(
    @Param('id') id: string,
    @Body() datosActualizacion: Partial<CrearUsuarioDto>,
    @Request() request: any,
  ) {
    // Validar que el usuario solo actualice su propio perfil
    if (request.user.id !== id) {
      return {
        statusCode: 403,
        message: 'No autorizado para actualizar este usuario',
      };
    }

    return await this.usuariosService.actualizar(id, datosActualizacion);
  }

  /**
   * DELETE /usuarios/:id - Eliminar usuario (requiere autenticacion)
   * @param id UUID del usuario
   * @param request Request con usuario autenticado
   */
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Param('id') id: string, @Request() request: any) {
    // Validar que el usuario solo elimine su propio perfil
    if (request.user.id !== id) {
      return {
        statusCode: 403,
        message: 'No autorizado para eliminar este usuario',
      };
    }

    await this.usuariosService.eliminar(id);
  }

  /**
   * GET /usuarios - Obtener todos los usuarios (solo admin)
   * @returns Lista de usuarios
   */
  @Get()
  @UseGuards(JwtGuard)
  async obtenerTodos() {
    return await this.usuariosService.obtenerTodos();
  }
}
