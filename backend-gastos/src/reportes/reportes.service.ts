import { Injectable, Logger } from '@nestjs/common';
import { GastosService } from '../gastos/gastos.service';
import * as nodemailer from 'nodemailer';

/**
 * Servicio de Reportes
 * Genera reportes Excel y los envia por correo electronico
 */
@Injectable()
export class ReportesService {
  private readonly logger = new Logger('ReportesService');
  private transporter: nodemailer.Transporter;

  constructor(private readonly gastosService: GastosService) {
    this.inicializarMailer();
  }

  /**
   * Inicializar configuracion de Nodemailer
   */
  private inicializarMailer(): void {
    this.transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.NODEMAILER_PORT || '587'),
      secure: false, // true para puerto 465, false para otros puertos
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    this.logger.log('Servicio de correo inicializado');
  }

  /**
   * Enviar reporte Excel por correo al usuario
   * @param emailDestino Email del usuario
   * @param nombreUsuario Nombre del usuario
   * @param mes Mes del reporte
   * @param anio Anio del reporte
   * @param usuarioId ID del usuario
   */
  async enviarReporteMensual(
    emailDestino: string,
    nombreUsuario: string,
    mes: number,
    anio: number,
    usuarioId: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Generando reporte para ${emailDestino} (${anio}-${mes})`,
      );

      // Generar archivo Excel
      const bufferExcel = await this.gastosService.generarReporteExcel(
        usuarioId,
        mes,
        anio,
      );

      // Preparar informacion del mes/anio en texto legible
      const meses = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ];
      const mesNombre = meses[mes - 1];

      // Configurar opciones del email
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: emailDestino,
        subject: `Reporte de Gastos - ${mesNombre} ${anio}`,
        html: this.generarHtmlEmail(nombreUsuario, mesNombre, anio),
        attachments: [
          {
            filename: `Reporte_Gastos_${anio}_${mes}.xlsx`,
            content: bufferExcel,
            contentType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
      };

      // Enviar email
      const resultado = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Reporte enviado exitosamente a ${emailDestino} (ID: ${resultado.messageId})`,
      );
    } catch (error) {
      this.logger.error(`Error enviando reporte: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generar HTML del email con información del reporte
   * @param nombreUsuario Nombre del usuario
   * @param mes Nombre del mes
   * @param anio Anio
   * @returns HTML formateado
   */
  private generarHtmlEmail(
    nombreUsuario: string,
    mes: string,
    anio: number,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background-color: #003366; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; }
            .content p { color: #333; line-height: 1.6; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
            .button { display: inline-block; background-color: #0055AA; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reporte de Gastos</h1>
              <p>${mes} ${anio}</p>
            </div>
            <div class="content">
              <p>Hola ${nombreUsuario},</p>
              <p>Te enviamos tu reporte de gastos del mes de <strong>${mes} ${anio}</strong>.</p>
              <p>El archivo Excel adjunto contiene el historial detallado de todas tus transacciones, incluyendo:</p>
              <ul>
                <li>Fecha de cada compra</li>
                <li>Comercio o tienda</li>
                <li>Categoria del gasto</li>
                <li>Monto en Quetzales (Q)</li>
                <li>Total mensual</li>
              </ul>
              <p>Descarga el archivo para analizar tus gastos en detalle.</p>
              <p>Si tienes dudas o necesitas ayuda, contactanos.</p>
              <p>Saludos,<br/>El equipo de Control de Gastos</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automatico. Por favor no respondas a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
