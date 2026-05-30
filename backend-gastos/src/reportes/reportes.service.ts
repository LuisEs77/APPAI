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

      // 1. Obtener gastos y estadísticas
      const mesPad = String(mes).padStart(2, '0');
      const fechaInicio = `${anio}-${mesPad}-01`;
      const ultimoDia = new Date(anio, mes, 0).getDate();
      const fechaFinStr = `${anio}-${mesPad}-${String(ultimoDia).padStart(2, '0')}`;

      this.logger.log(`Filtrando gastos desde ${fechaInicio} hasta ${fechaFinStr} para usuario ${usuarioId}`);

      const recibos = await this.gastosService.obtenerRecibos(usuarioId, {
        fechaInicio,
        fechaFin: fechaFinStr,
      });

      this.logger.log(`Recibos encontrados para el periodo: ${recibos.length}`);
      
      if (recibos.length > 0) {
        this.logger.log(`Primer recibo: ${recibos[0].comercio} - ${recibos[0].fecha} - Q${recibos[0].total}`);
      }

      // Calcular estadísticas localmente para evitar doble consulta a la BD
      const totalGastado = recibos.reduce((sum, r) => sum + Number(r.total), 0);

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
      const asunto = `Resumen de Gastos - ${mesNombre} ${anio}`;
      const html = this.generarHtmlEmail(nombreUsuario, mesNombre, anio, totalGastado, recibos);

      // Enviar exclusivamente por EmailJS REST (requerido en .env):
      const emailjsConfigured =
        !!process.env.EMAILJS_SERVICE_ID && !!process.env.EMAILJS_TEMPLATE_ID && !!process.env.EMAILJS_PUBLIC_KEY;

      if (!emailjsConfigured) {
        throw new Error(
          'No hay configuración de EmailJS. Define EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID y EMAILJS_PUBLIC_KEY en el .env',
        );
      }

      const payload: any = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN,
        template_params: {
          name: nombreUsuario,
          email: emailDestino,
          subject: asunto,
          message: `Aquí tienes el detalle de tus gastos de ${mesNombre} ${anio}. Total gastado: Q${totalGastado.toFixed(2)}`,
          html,
          total_gastado: `Q${totalGastado.toFixed(2)}`,
          mes_reporte: mesNombre,
          anio_reporte: anio.toString(),
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
   * @param recibos Lista de recibos detallados
   * @returns HTML formateado
   */
  private generarHtmlEmail(
    nombreUsuario: string,
    mes: string,
    anio: number,
    total: number,
    recibos: any[],
  ): string {
    const filasTabla = recibos
      .map(
        (r) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.fecha}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.comercio}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${r.categoria}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Q${Number(
          r.total,
        ).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background-color: #003366; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 20px; }
            .content p { color: #333; line-height: 1.6; }
            .total-destacado { background-color: #e6f2ff; padding: 15px; border-left: 5px solid #0055AA; margin: 20px 0; font-size: 18px; color: #003366; text-align: center; }
            .detalle-tabla { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            .detalle-tabla th { background-color: #f8f9fa; color: #003366; text-align: left; padding: 10px; border-bottom: 2px solid #003366; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Resumen de Gastos</h1>
              <p>${mes} ${anio}</p>
            </div>
            <div class="content">
              <p>Hola <strong>${nombreUsuario}</strong>,</p>
              <p>Este es el resumen detallado de tus gastos realizados en <strong>${mes} ${anio}</strong>.</p>
              
              <div class="total-destacado">
                Total Gastado: <strong>Q${total.toFixed(2)}</strong>
              </div>

              <table class="detalle-tabla">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Comercio</th>
                    <th>Categoría</th>
                    <th style="text-align: right;">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasTabla}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">TOTAL:</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #0055AA;">Q${total.toFixed(
                      2,
                    )}</td>
                  </tr>
                </tfoot>
              </table>

              <p style="margin-top: 30px;">Si tienes dudas o necesitas ayuda con el registro de tus gastos, no dudes en contactarnos.</p>
              <p>Saludos,<br/>El equipo de Control de Gastos</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático enviado desde tu aplicación de Control de Gastos. Por favor no respondas a este correo.</p>
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
