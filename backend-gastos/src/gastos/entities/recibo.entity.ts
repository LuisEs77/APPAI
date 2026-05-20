import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad Recibo: Representa un recibo de compra procesado
 * Almacena los datos extraídos por la IA de una imagen de factura
 *
 * Anti-Duplicidad: El campo imagen_hash es ÚNICO para evitar registros duplicados
 */
@Entity('recibos')
@Index(['imagen_hash'], { unique: true })
@Index(['comercio', 'fecha', 'total'])
export class Recibo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Hash SHA-256 de la imagen en Base64
   * Usado como llave única para evitar duplicados
   */
  @Column({ type: 'varchar', length: 64, unique: true })
  imagen_hash: string;

  /**
   * Fecha de la compra (extraída de la factura por la IA)
   */
  @Column({ type: 'date' })
  fecha: string;

  /**
   * Nombre del comercio / tienda (extraído por la IA)
   */
  @Column({ type: 'varchar', length: 255 })
  comercio: string;

  /**
   * Categoría del gasto (Alimentación, Transporte, etc.)
   */
  @Column({ type: 'varchar', length: 100 })
  categoria: string;

  /**
   * Monto total de la compra
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  /**
   * Estado del recibo (Registrado, Validado, etc.)
   */
  @Column({ type: 'varchar', length: 50, default: 'Registrado' })
  estado: string;

  /**
   * URL o ruta de la imagen original (opcional, si deseas guardarla)
   */
  @Column({ type: 'text', nullable: true })
  imagen_base64_preview?: string;

  /**
   * Fecha de creación (automática)
   */
  @CreateDateColumn()
  created_at: Date;

  /**
   * Fecha de actualización (automática)
   */
  @UpdateDateColumn()
  updated_at: Date;
}
