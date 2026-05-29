import { Injectable, Logger } from '@nestjs/common';
import { GastosService } from '../gastos/gastos.service';
import axios from 'axios';

/**
 * Servicio de Reportes
 * Genera reportes Excel y los envia por correo electronico
 */
@Injectable()
export class ReportesService {
  private readonly logger = new Logger('ReportesService');

  constructor(private readonly gastosService: GastosService) {}

  // Envío de emails ahora se realiza exclusivamente usando EmailJS (REST API).
  // Asegúrate de definir EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID y EMAILJS_PUBLIC_KEY en el .env.

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

      // 1. Obtener estadísticas para incluir el Total Gastado
      const estadisticas = await this.gastosService.obtenerEstadisticas(
        usuarioId,
        mes,
        anio,
      );
      const totalGastado = estadisticas.totalGastado;

      // 2. Generar archivo Excel
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

      // Preparar opciones comunes
      const asunto = `Reporte de Gastos - ${mesNombre} ${anio}`;
      const html = this.generarHtmlEmail(nombreUsuario, mesNombre, anio, totalGastado);

      // Enviar exclusivamente por EmailJS REST (requerido en .env):
      const emailjsConfigured =
        !!process.env.EMAILJS_SERVICE_ID && !!process.env.EMAILJS_TEMPLATE_ID && !!process.env.EMAILJS_PUBLIC_KEY;

      if (!emailjsConfigured) {
        throw new Error(
          'No hay configuración de EmailJS. Define EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID y EMAILJS_PUBLIC_KEY en el .env',
        );
      }

      // IMPORTANTE: Para enviar adjuntos con la API REST de EmailJS, 
      // el archivo debe ir DENTRO de template_params como una variable
      // que debe estar configurada en el Dashboard de EmailJS como "Variable Attachment".
      const payload: any = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN,
        template_params: {
          name: nombreUsuario,
          email: emailDestino,
          subject: asunto,
          message: `Adjunto tu reporte de ${mesNombre} ${anio}. Total gastado: Q${totalGastado.toFixed(2)}`,
          html,
          total_gastado: `Q${totalGastado.toFixed(2)}`,
          mes_reporte: mesNombre,
          anio_reporte: anio.toString(),
          // Se envía el base64 sin el prefijo data: si se configura como Variable Attachment
          reporte_excel: bufferExcel ? bufferExcel.toString('base64') : null,
        },
      };

      const headers = { 'Content-Type': 'application/json' };

      try {
        const res = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, { headers });
        if (res.status >= 200 && res.status < 300) {
          this.logger.log(`Reporte enviado exitosamente por EmailJS a ${emailDestino}`);
          return;
        }
        this.logger.warn(`EmailJS respondió con status ${res.status} al enviar a ${emailDestino}`);
        throw new Error(`EmailJS respondió con status ${res.status}`);
      } catch (err) {
        const e: any = err;
        this.logger.error(`Error enviando reporte por EmailJS: ${e.message || e}`);
        if (e.response) {
          this.logger.error(`EmailJS response status=${e.response.status} data=${JSON.stringify(e.response.data)}`);
        }
        throw err;
      }
    } catch (error) {
      this.logger.error(`Error enviando reporte: ${(error as any).message || error}`, (error as any).stack);
      throw error;
    }
  }

  /**
   * Generar HTML del email con información del reporte
   * @param nombreUsuario Nombre del usuario
   * @param mes Nombre del mes
   * @param anio Anio
   * @param total Gastado
   * @returns HTML formateado
   */
  private generarHtmlEmail(
    nombreUsuario: string,
    mes: string,
    anio: number,
    total: number,
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
            .total-destacado { background-color: #e6f2ff; padding: 15px; border-left: 5px solid #0055AA; margin: 20px 0; font-size: 18px; color: #003366; }
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
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Te enviamos tu reporte de gastos del mes de <strong>${mes} ${anio}</strong>.</p>
              
              <div class="total-destacado">
                Total Gastado: <strong>Q${total.toFixed(2)}</strong>
              </div>

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

  /**
   * Enviar correo de prueba (sin adjuntos) usando EmailJS REST
   * @param emailDestino Email destino
   * @param nombreUsuario Nombre del destinatario (opcional)
   */
  async enviarCorreoPrueba(emailDestino: string, nombreUsuario = ''): Promise<void> {
    try {
      const asunto = 'Correo de prueba - Control de Gastos';
      const html = `<p>Hola ${nombreUsuario || 'usuario'},</p><p>Este es un correo de prueba enviado desde el backend de Control de Gastos.</p><p>Si recibes este correo, la integración funciona correctamente.</p>`;

      const emailjsConfigured =
        !!process.env.EMAILJS_SERVICE_ID && !!process.env.EMAILJS_TEMPLATE_ID && !!process.env.EMAILJS_PUBLIC_KEY;

      if (!emailjsConfigured) {
        throw new Error('No hay configuración de EmailJS. Define EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID y EMAILJS_PUBLIC_KEY en el .env');
      }

      const payload: any = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN,
        // Ajuste: enviar las variables que usa tu plantilla (name, email)
        template_params: {
          name: nombreUsuario || 'Usuario',
          email: emailDestino,
          subject: asunto,
          message: 'Correo de prueba desde la aplicación',
          html,
        },
      };

      console.log(
        `[REPORTES] Sending test email via EmailJS to=${emailDestino} service=${process.env.EMAILJS_SERVICE_ID} template=${process.env.EMAILJS_TEMPLATE_ID}`,
      );

      const headers = { 'Content-Type': 'application/json' };

      try {
        const res = await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, { headers });
        if (res.status >= 200 && res.status < 300) {
          this.logger.log(`Correo de prueba enviado por EmailJS a ${emailDestino}`);
          return;
        }
        this.logger.warn(`EmailJS responded with status ${res.status} when sending to ${emailDestino}`);
        throw new Error(`EmailJS responded with status ${res.status}`);
      } catch (emailJsErr) {
        const e: any = emailJsErr;
        this.logger.error('Envio por EmailJS fallo: ' + (e.message || e));
        if (e.response) {
          this.logger.error(`EmailJS response status=${e.response.status} data=${JSON.stringify(e.response.data)}`);
        }
        throw emailJsErr;
      }
    } catch (error) {
      this.logger.error(`Error enviando correo de prueba: ${(error as any).message || error}`, (error as any).stack);
      throw error;
    }
  }
}
