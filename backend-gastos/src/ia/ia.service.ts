import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IaService {
  // REQUERIMIENTO: Observabilidad básica (Logs)
  private readonly logger = new Logger(IaService.name);
  private readonly OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';

  constructor(private readonly httpService: HttpService) {}

  async analizarImagen(imageBase64: string): Promise<any> {
    this.logger.log('Iniciando análisis de imagen con IA Local (Vision)...');

    // Limpiamos el base64 por si viene con el prefijo "data:image/jpeg;base64," desde la app móvil
    const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // PROMPT ENGINEERING: Instrucciones estrictas para la IA
    const prompt = `
      Analiza la imagen del recibo adjunto y extrae la información.
      Debes responder ÚNICAMENTE con un objeto JSON válido, sin usar bloques de código de Markdown (como \`\`\`json).
      Usa exactamente las siguientes claves:
      - "comercio": El nombre del establecimiento. Si no lo sabes, usa "Desconocido".
      - "fecha": En formato YYYY-MM-DD. Si no la encuentras, usa la fecha de hoy.
      - "total": El valor numérico total de la compra (solo el número, sin el símbolo de moneda). Si no lo encuentras, usa 0.
      - "categoria": Clasifica el gasto en UNA de estas opciones exactas: Alimentación, Transporte, Servicios, Hogar, Otros.
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.OLLAMA_URL, {
          model: 'llama3.2-vision', // 👈 ¡AQUÍ ESTÁ EL CAMBIO PRINCIPAL!
          prompt: prompt,
          images: [base64Clean],
          stream: false,
          format: 'json' // Excelente práctica mantener esto para forzar la estructura
        }, 
        {
          timeout: 45000 // 👈 Tip Pro: 45 segundos de paciencia para que la IA lea bien la factura
        })
      );

      this.logger.log('Respuesta recibida desde la IA. Procesando datos...');
      
      const iaResponse = response.data.response;
      
      // Parseamos la respuesta cruda de la IA
      const jsonData = JSON.parse(iaResponse);
      return jsonData;

    } catch (error) {
      this.logger.error('Error al comunicarse con la IA local', error.message);
      throw new InternalServerErrorException('El modelo de IA falló al procesar la imagen.');
    }
  }
}