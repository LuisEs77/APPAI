import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de Usuarios
 * Maneja operaciones CRUD y validaciones de usuarios
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  /**
   * Crear nuevo usuario con contraseña hasheada
   * @param crearUsuarioDto Datos del nuevo usuario
   * @returns Usuario creado (sin password)
   */
  async crear(crearUsuarioDto: CrearUsuarioDto): Promise<Usuario> {
    // Verificar que el email no exista
    const usuarioExistente = await this.usuariosRepository.findOne({
      where: { email: crearUsuarioDto.email },
    });

    if (usuarioExistente) {
      throw new BadRequestException(
        'El email ya esta registrado en el sistema',
      );
    }

    // Hashear contraseña con bcrypt (10 rounds)
    const passwordHasheada = await bcrypt.hash(crearUsuarioDto.password, 10);

    // Crear nuevo usuario
    const nuevoUsuario = this.usuariosRepository.create({
      email: crearUsuarioDto.email,
      password: passwordHasheada,
      nombre: crearUsuarioDto.nombre,
      apellido: crearUsuarioDto.apellido || '',
      telefono: crearUsuarioDto.telefono || '',
      activo: true,
    });

    const usuarioGuardado =
      await this.usuariosRepository.save(nuevoUsuario);

    // No retornar password en respuesta
    const { password: _, ...usuarioSinPassword } = usuarioGuardado;
    return usuarioSinPassword as any;
  }

  /**
   * Obtener usuario por email
   * @param email Email del usuario
   * @returns Usuario completo (incluye password para validacion)
   */
  async obtenerPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  /**
   * Obtener usuario por ID
   * @param id UUID del usuario
   * @returns Usuario sin password
   */
  async obtenerPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      relations: ['recibos'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword as any;
  }

  /**
   * Validar que la contraseña sea correcta
   * @param passwordIngresada Password en texto plano
   * @param passwordHasheada Password hasheada almacenada
   * @returns true si coinciden
   */
  async validarPassword(
    passwordIngresada: string,
    passwordHasheada: string,
  ): Promise<boolean> {
    return await bcrypt.compare(passwordIngresada, passwordHasheada);
  }

  /**
   * Obtener todos los usuarios (solo para administradores)
   * @returns Lista de usuarios sin passwords
   */
  async obtenerTodos(): Promise<Usuario[]> {
    const usuarios = await this.usuariosRepository.find();
    return usuarios.map((u) => {
      const { password: _, ...usuarioSinPassword } = u;
      return usuarioSinPassword as any;
    });
  }

  /**
   * Actualizar datos del usuario
   * @param id ID del usuario
   * @param datosActualizacion Datos a actualizar
   * @returns Usuario actualizado
   */
  async actualizar(
    id: string,
    datosActualizacion: Partial<CrearUsuarioDto>,
  ): Promise<Usuario> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se intenta cambiar password, hashearla
    if (datosActualizacion.password) {
      datosActualizacion.password = await bcrypt.hash(
        datosActualizacion.password,
        10,
      );
    }

    await this.usuariosRepository.update(id, datosActualizacion);
    const usuarioActualizado = await this.obtenerPorId(id);

    return usuarioActualizado;
  }

  /**
   * Eliminar usuario (soft delete, marcar como inactivo)
   * @param id ID del usuario
   */
  async eliminar(id: string): Promise<void> {
    const usuario = await this.obtenerPorId(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usuariosRepository.update(id, { activo: false });
  }
}
