import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Recibo } from '../../gastos/entities/recibo.entity';

/**
 * Entidad Usuario para autenticacion multiusuario
 * Contiene credenciales y relacion con recibos del usuario
 */
@Entity('usuarios')
@Index(['email'], { unique: true })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // Hasheada con bcrypt

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido: string;

  @Column({ type: 'text', nullable: true })
  telefono: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  /**
   * Relacion OneToMany con Recibos
   * Un usuario puede tener multiples recibos
   */
  @OneToMany(() => Recibo, (recibo) => recibo.usuario, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  recibos: Recibo[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
