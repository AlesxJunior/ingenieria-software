// alexa-tech-backend/src/modules/ai/ai-recommendations.service.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { getClimateData, ClimateData } from './climate-data';

const prisma = new PrismaClient();

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Usar gemini-2.5-flash (el más nuevo y potente disponible)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface ClientContext {
  id: string;
  nombre: string;
  numeroDocumento: string;
  ubicacion: {
    departamento: string;
    provincia: string;
    distrito: string;
  };
  historial: {
    totalCompras: number;
    ticketPromedio: number;
    categoriasCompradas: string[];
    ultimaCompra: Date | null;
  };
  historialCompras: any[];
}

interface ProductData {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | { nombre: string };
  precio: number;
  precioVenta: number;
  stock: number;
}

interface AIRecommendation {
  productoId: string;
  nombre: string;
  codigo: string;
  precio: number;
  score: number;
  razones: string[];
  ventajas: string[];
  consideraciones: string[];
}

interface AIResponse {
  recomendaciones: AIRecommendation[];
  productosNoRecomendados: Array<{
    tipo: string;
    razon: string;
  }>;
  productosComplementarios: Array<{
    nombre: string;
    razon: string;
  }>;
  tips: string[];
  pasosAnalisis?: Array<{
    paso: number;
    titulo: string;
    descripcion: string;
    datos: any;
    timestamp: string;
  }>;
  contextoCliente?: {
    ubicacion: string;
    clima: string;
    historialCompras: number;
  };
}

/**
 * Servicio de Recomendaciones con IA usando Google Gemini
 */
export class AIRecommendationsService {
  /**
   * Genera recomendaciones inteligentes basadas en contexto del cliente
   */
  async generateRecommendations(
    clienteId: string,
    consulta: string,
    options?: {
      categoria?: string;
      presupuestoMax?: number;
    }
  ): Promise<AIResponse> {
    const pasosAnalisis: Array<{
      paso: number;
      titulo: string;
      descripcion: string;
      datos: any;
      timestamp: string;
    }> = [];

    try {
      console.log('🕵️ [AI DETECTIVE] Iniciando investigación...');
      console.log('🔍 Cliente:', clienteId);
      console.log('💬 Consulta:', consulta);

      // 🕵️ PASO 1: Obtener contexto del cliente
      const startTime1 = Date.now();
      const clienteContext = await this.getClientContext(clienteId);
      pasosAnalisis.push({
        paso: 1,
        titulo: 'Investigando Perfil del Cliente',
        descripcion: `Analizando información del cliente para entender su ubicación, historial de compras y necesidades específicas`,
        datos: {
          cliente: clienteContext.nombre,
          documento: clienteContext.numeroDocumento,
          ubicacion: `${clienteContext.ubicacion.distrito}, ${clienteContext.ubicacion.provincia}, ${clienteContext.ubicacion.departamento}`,
          totalCompras: clienteContext.historialCompras.length,
          ultimaCompra: clienteContext.historialCompras[0]?.createdAt 
            ? new Date(clienteContext.historialCompras[0].createdAt).toLocaleDateString('es-PE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : 'Sin compras previas',
          ticketPromedio: clienteContext.historial.ticketPromedio.toFixed(2),
          tiempoAnalisis: `${Date.now() - startTime1}ms`
        },
        timestamp: new Date().toISOString()
      });
      console.log('✅ [AI] Paso 1 completado: Perfil del cliente obtenido');

      // 🕵️ PASO 2: Análisis climático y geográfico
      const startTime2 = Date.now();
      const locationInsights = getClimateData(
        clienteContext.ubicacion.departamento,
        clienteContext.ubicacion.provincia
      );
      pasosAnalisis.push({
        paso: 2,
        titulo: 'Análisis Climático y Geográfico',
        descripcion: `Investigando condiciones ambientales de ${clienteContext.ubicacion.departamento} para determinar requisitos técnicos específicos`,
        datos: {
          clima: locationInsights.clima,
          temperatura: locationInsights.temperatura,
          caracteristicas: locationInsights.caracteristicas,
          tiempoAnalisis: `${Date.now() - startTime2}ms`
        },
        timestamp: new Date().toISOString()
      });
      console.log('✅ [AI] Paso 2 completado: Datos climáticos analizados');

      // 🕵️ PASO 3: Búsqueda inteligente de productos
      const startTime3 = Date.now();
      const productosRelevantes = await this.getRelevantProducts(
        consulta,
        options
      );
      pasosAnalisis.push({
        paso: 3,
        titulo: 'Búsqueda Inteligente en Inventario',
        descripcion: `Escaneando ${consulta} en base de datos con algoritmo de búsqueda avanzada (normalización de texto, palabras clave)`,
        datos: {
          consulta: consulta,
          productosEncontrados: productosRelevantes.length,
          categorias: [...new Set(productosRelevantes.map(p => typeof p.categoria === 'string' ? p.categoria : p.categoria?.nombre).filter(Boolean))],
          rangoPrecios: productosRelevantes.length > 0 ? {
            minimo: Math.min(...productosRelevantes.map(p => Number(p.precioVenta))),
            maximo: Math.max(...productosRelevantes.map(p => Number(p.precioVenta)))
          } : null,
          tiempoAnalisis: `${Date.now() - startTime3}ms`
        },
        timestamp: new Date().toISOString()
      });
      console.log(
        `✅ [AI] Paso 3 completado: ${productosRelevantes.length} productos encontrados`
      );

      if (productosRelevantes.length === 0) {
        pasosAnalisis.push({
          paso: 4,
          titulo: 'Inventario Insuficiente',
          descripcion: 'No se encontraron productos en stock. Generando recomendaciones generales basadas en análisis climático',
          datos: {
            sugerencia: 'Agregar productos al inventario para obtener recomendaciones específicas'
          },
          timestamp: new Date().toISOString()
        });

        return {
          recomendaciones: [],
          productosNoRecomendados: [],
          productosComplementarios: [],
          tips: [
            'No se encontraron productos que coincidan con tu búsqueda.',
            'Intenta con términos más generales como "cámara", "router", etc.',
          ],
          pasosAnalisis,
          contextoCliente: {
            ubicacion: `${clienteContext.ubicacion.distrito}, ${clienteContext.ubicacion.departamento}`,
            clima: locationInsights.clima,
            historialCompras: clienteContext.historialCompras.length
          }
        };
      }

      // 🕵️ PASO 4: Consulta a Gemini AI (el cerebro)
      const startTime4 = Date.now();
      const prompt = this.buildPrompt(
        clienteContext,
        locationInsights,
        productosRelevantes,
        consulta
      );

      pasosAnalisis.push({
        paso: 4,
        titulo: 'Análisis con Inteligencia Artificial',
        descripcion: 'Consultando a Gemini AI para generar recomendaciones personalizadas basadas en todos los datos recopilados',
        datos: {
          modelo: 'gemini-2.5-flash',
          contextLength: prompt.length,
          parametros: {
            clima: locationInsights.clima,
            productosAnalizados: productosRelevantes.length,
            historialCliente: clienteContext.historialCompras.length
          },
          estado: 'Procesando...'
        },
        timestamp: new Date().toISOString()
      });

      console.log('🧠 [AI] Consultando Gemini AI...');
      
      // Implementar reintentos para manejar errores 503 (Service Overloaded)
      let result;
      let lastError;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 segundos entre reintentos
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 [AI] Intento ${attempt}/${maxRetries}...`);
          result = await model.generateContent(prompt);
          console.log('✅ [AI] Respuesta recibida exitosamente');
          break; // Éxito, salir del loop
        } catch (error: any) {
          lastError = error;
          const is503 = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded');
          
          if (is503 && attempt < maxRetries) {
            console.log(`⚠️ [AI] Servicio sobrecargado (503). Reintentando en ${retryDelay/1000}s... (${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          } else {
            // Último intento fallido o error diferente a 503
            throw error;
          }
        }
      }
      
      if (!result) {
        throw lastError; // Si todos los reintentos fallaron
      }
      
      const response = result.response;
      const aiText = response.text();

      // Actualizar paso 4 con resultado
      if (pasosAnalisis[3]) {
        pasosAnalisis[3].datos.estado = 'Completado';
        pasosAnalisis[3].datos.tiempoAnalisis = `${Date.now() - startTime4}ms`;
        pasosAnalisis[3].datos.tokensGenerados = aiText.length;
      }

      console.log('✅ [AI] Respuesta recibida de Gemini');

      // 🕵️ PASO 5: Procesamiento y estructuración de resultados
      const startTime5 = Date.now();
      pasosAnalisis.push({
        paso: 5,
        titulo: 'Procesando Resultados',
        descripcion: 'Estructurando y validando las recomendaciones generadas por la IA',
        datos: {
          estado: 'Parseando JSON...',
        },
        timestamp: new Date().toISOString()
      });

      // Parsear respuesta JSON
      const aiResponse = this.parseAIResponse(aiText);

      // 🔧 Enriquecer productos complementarios con datos reales de la BD
      const enrichedComplementarios = await this.enrichComplementaryProducts(aiResponse.productosComplementarios);

      // Actualizar paso 5 con resultado final
      if (pasosAnalisis[4]) {
        pasosAnalisis[4].datos = {
          estado: 'Completado',
          recomendados: aiResponse.recomendaciones.length,
          noRecomendados: aiResponse.productosNoRecomendados.length,
          tips: aiResponse.tips.length,
          tiempoAnalisis: `${Date.now() - startTime5}ms`,
          tiempoTotal: `${Date.now() - startTime1}ms`
        };
      }

      // 5. Guardar log de recomendación
      await this.logRecommendation(clienteId, consulta, aiResponse);

      return {
        ...aiResponse,
        productosComplementarios: enrichedComplementarios,
        pasosAnalisis,
        contextoCliente: {
          ubicacion: `${clienteContext.ubicacion.distrito}, ${clienteContext.ubicacion.departamento}`,
          clima: locationInsights.clima,
          historialCompras: clienteContext.historialCompras.length
        }
      };
    } catch (error: any) {
      console.error('❌ [AI] Error generando recomendaciones:', error);
      
      // Mensajes de error más amigables según el tipo
      let userMessage = 'Error al generar recomendaciones';
      
      if (error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded')) {
        userMessage = 'El servicio de IA está temporalmente sobrecargado. Por favor, inténtalo nuevamente en unos segundos.';
      } else if (error?.status === 429) {
        userMessage = 'Límite de solicitudes alcanzado. Por favor, espera un momento antes de reintentar.';
      } else if (error?.message?.includes('API key')) {
        userMessage = 'Error de configuración de API. Contacta al administrador del sistema.';
      } else if (error instanceof Error) {
        userMessage = `Error al generar recomendaciones: ${error.message}`;
      }
      
      throw new Error(userMessage);
    }
  }

  /**
   * Obtiene contexto completo del cliente desde la BD
   */
  private async getClientContext(clienteId: string): Promise<ClientContext> {
    const cliente = await prisma.client.findUnique({
      where: { id: clienteId },
      include: {
        departamento: true,
        provincia: true,
        distrito: true,
        sales: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Últimas 10 compras
        },
      },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Calcular estadísticas
    const totalCompras = cliente.sales.length;
    const ticketPromedio =
      cliente.sales.reduce((sum, sale) => sum + Number(sale.total), 0) /
      (totalCompras || 1);

    const categoriasCompradas = [
      ...new Set(
        cliente.sales.flatMap((sale) =>
          sale.items.map(
            (item) => item.product.categoria_legacy || 'General'
          )
        )
      ),
    ];

    return {
      id: cliente.id,
      nombre: cliente.nombres
        ? `${cliente.nombres} ${cliente.apellidos}`
        : cliente.razonSocial || 'Cliente',
      numeroDocumento: cliente.numeroDocumento || '',
      ubicacion: {
        departamento: cliente.departamento.nombre,
        provincia: cliente.provincia.nombre,
        distrito: cliente.distrito.nombre,
      },
      historial: {
        totalCompras,
        ticketPromedio,
        categoriasCompradas,
        ultimaCompra: cliente.sales[0]?.createdAt || null,
      },
      historialCompras: cliente.sales,
    };
  }

  /**
   * Obtiene productos relevantes basados en consulta
   */
  private async getRelevantProducts(
    consulta: string,
    options?: { categoria?: string; presupuestoMax?: number }
  ): Promise<ProductData[]> {
    // Normalizar consulta: remover tildes y convertir a minúsculas
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const consultaNormalizada = normalizeText(consulta);

    // Palabras clave a buscar
    const palabras = consultaNormalizada.split(' ').filter((p) => p.length > 2);

    const whereConditions: any = {
      AND: [
        {
          estado: true, // Solo productos activos
        },
        {
          OR: palabras.flatMap((palabra) => [
            {
              nombre: {
                contains: palabra,
                mode: 'insensitive',
              },
            },
            {
              descripcion: {
                contains: palabra,
                mode: 'insensitive',
              },
            },
            {
              codigo: {
                contains: palabra,
                mode: 'insensitive',
              },
            },
          ]),
        },
      ],
    };

    // Filtro por categoría
    if (options?.categoria) {
      whereConditions.AND.push({
        categoria_legacy: {
          equals: options.categoria,
          mode: 'insensitive',
        },
      });
    }

    // Filtro por presupuesto
    if (options?.presupuestoMax) {
      whereConditions.AND.push({
        precioVenta: {
          lte: options.presupuestoMax,
        },
      });
    }

    const productos = await prisma.product.findMany({
      where: whereConditions,
      include: {
        categoria: true,
        unidadMedida: true,
        stockByWarehouses: {
          select: {
            quantity: true
          }
        }
      },
      take: 20, // Top 20 productos relevantes
    });

    return productos.map((p) => {
      // Calcular stock real agregado de todos los almacenes
      const stock = p.stockByWarehouses.reduce((sum: number, s: any) => sum + s.quantity, 0);
      
      return {
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        descripcion: p.descripcion,
        categoria: p.categoria?.nombre || p.categoria_legacy || 'General',
        precio: Number(p.precioVenta),
        precioVenta: Number(p.precioVenta),
        stock,
      };
    });
  }

  /**
   * Enriquece productos complementarios con datos reales de la BD
   */
  private async enrichComplementaryProducts(
    productosComplementarios: Array<{ nombre: string; razon: string }>
  ): Promise<any[]> {
    const enriched = [];

    for (const producto of productosComplementarios) {
      try {
        console.log(`🔍 [AI] Buscando producto complementario: "${producto.nombre}"`);
        
        // Intentar extraer el código del producto del nombre si viene entre paréntesis
        const codigoMatch = producto.nombre.match(/\(Código:\s*([^)]+)\)/i);
        const codigo = codigoMatch?.[1]?.trim() || null;
        
        // Limpiar el nombre (quitar el código si existe)
        const nombreLimpio = producto.nombre.replace(/\s*\(Código:.*?\)/i, '').trim();

        // Buscar el producto en la BD por código o nombre
        let productoDB;
        
        if (codigo) {
          // Primero intentar buscar por código
          productoDB = await prisma.product.findFirst({
            where: {
              codigo: codigo,
              estado: true
            },
            include: {
              stockByWarehouses: {
                select: {
                  quantity: true
                }
              }
            }
          });
          console.log(`🔍 [AI] Búsqueda por código "${codigo}":`, productoDB ? 'Encontrado ✓' : 'No encontrado ✗');
        }

        if (!productoDB) {
          // Si no se encontró por código, buscar por nombre
          productoDB = await prisma.product.findFirst({
            where: {
              nombre: {
                contains: nombreLimpio,
                mode: 'insensitive'
              },
              estado: true
            },
            include: {
              stockByWarehouses: {
                select: {
                  quantity: true
                }
              }
            }
          });
          console.log(`🔍 [AI] Búsqueda por nombre "${nombreLimpio}":`, productoDB ? 'Encontrado ✓' : 'No encontrado ✗');
        }

        if (productoDB) {
          // Calcular stock total
          const stock = productoDB.stockByWarehouses.reduce((sum, s) => sum + s.quantity, 0);

          enriched.push({
            productoId: productoDB.id,
            nombre: productoDB.nombre,
            precio: Number(productoDB.precioVenta),
            stock,
            razones: [producto.razon]
          });
          console.log(`✅ [AI] Producto enriquecido:`, {
            nombre: productoDB.nombre,
            precio: Number(productoDB.precioVenta),
            stock
          });
        } else {
          // Si no se encuentra el producto, incluirlo sin datos de BD
          console.warn(`⚠️ [AI] Producto complementario no encontrado en BD: ${producto.nombre}`);
          enriched.push({
            productoId: `temp-${Date.now()}-${Math.random()}`,
            nombre: producto.nombre,
            precio: 0,
            stock: 0,
            razones: [producto.razon]
          });
        }
      } catch (error) {
        console.error(`❌ [AI] Error enriqueciendo producto ${producto.nombre}:`, error);
      }
    }

    console.log(`📊 [AI] Total productos complementarios enriquecidos: ${enriched.length}`);
    return enriched;
  }

  /**
   * Construye el prompt para Gemini AI
   */
  private buildPrompt(
    clienteContext: ClientContext,
    locationInsights: ClimateData,
    productos: ProductData[],
    consulta: string
  ): string {
    return `Eres un experto asesor de ventas de AlexaTech, especializado en productos de tecnología y seguridad electrónica. 
Tu objetivo es recomendar los mejores productos según las necesidades del cliente, considerando ESPECIALMENTE su ubicación geográfica, clima y condiciones ambientales.

CONTEXTO DEL CLIENTE:
- Nombre: ${clienteContext.nombre}
- Ubicación: ${clienteContext.ubicacion.distrito}, ${clienteContext.ubicacion.provincia}, ${clienteContext.ubicacion.departamento}
- Clima de la zona: ${locationInsights.clima} (${locationInsights.temperatura})
- Características especiales: ${locationInsights.caracteristicas.join(', ')}
- Historial de compras: ${clienteContext.historial.totalCompras} compras
- Ticket promedio: S/ ${clienteContext.historial.ticketPromedio.toFixed(2)}
- Categorías compradas previamente: ${clienteContext.historial.categoriasCompradas.join(', ') || 'Ninguna'}

CONSULTA DEL CLIENTE:
"${consulta}"

PRODUCTOS DISPONIBLES EN STOCK:
${productos.length > 0 
  ? productos.map((p, idx) => `
${idx + 1}. ${p.nombre} (Código: ${p.codigo})
   - Precio: S/ ${p.precio.toFixed(2)}
   - Stock disponible: ${p.stock} unidades
   - Categoría: ${p.categoria}
   ${p.descripcion ? `- Descripción: ${p.descripcion}` : ''}
   - ID: ${p.id}
`).join('\n')
  : '⚠️ NO HAY PRODUCTOS ACTUALMENTE EN INVENTARIO que coincidan con la búsqueda'}

${
  productos.length === 0
    ? `
**IMPORTANTE**: No hay productos en stock que coincidan con "${consulta}".

En este caso, debes:
1. Explicar qué tipo de productos serían ideales para la ubicación/clima del cliente
2. Dar recomendaciones específicas basadas en las condiciones climáticas
3. Sugerir características técnicas que deben buscar
4. Advertir sobre productos que NO son adecuados para su zona
5. Dar tips útiles para cuando adquieran estos productos

Responde con el formato JSON pero en "recomendaciones" puedes poner un array vacío [],
y enfócate en llenar "productosComplementarios" con sugerencias generales y "tips" con consejos valiosos.
`
    : ''
}

RECOMENDACIONES CLIMÁTICAS PARA LA ZONA:
${locationInsights.recomendaciones.join(', ')}

INSTRUCCIONES:
1. Lee DETENIDAMENTE las DESCRIPCIONES de cada producto (si están disponibles) para entender sus características reales
2. Analiza CUIDADOSAMENTE el clima y condiciones de la ubicación del cliente
3. Recomienda productos que SE AJUSTEN específicamente a esas condiciones BASÁNDOTE en sus descripciones
4. NO inventes características que no están en la descripción del producto
5. Si un producto NO tiene descripción detallada, basa tu recomendación solo en su nombre y categoría
6. Explica CLARAMENTE por qué cada producto es adecuado para el clima/zona usando información REAL del producto
7. Incluye advertencias si hay productos que NO son recomendables para esa zona
8. Sugiere productos complementarios si es relevante
9. Proporciona tips específicos para la ubicación

FORMATO DE RESPUESTA (JSON):
Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:

{
  "recomendaciones": [
    {
      "productoId": "id del producto",
      "nombre": "nombre del producto",
      "codigo": "código del producto",
      "precio": 0,
      "score": 95,
      "razones": [
        "Razón 1: Específica para el clima/ubicación (IMPORTANTE)",
        "Razón 2: Característica técnica relevante",
        "Razón 3: Basada en historial del cliente si aplica"
      ],
      "ventajas": [
        "Ventaja 1",
        "Ventaja 2"
      ],
      "consideraciones": [
        "Consideración importante 1",
        "Mantenimiento requerido"
      ]
    }
  ],
  "productosNoRecomendados": [
    {
      "tipo": "Tipo de productos NO recomendados",
      "razon": "Por qué NO son adecuados para esta zona/clima"
    }
  ],
  "productosComplementarios": [
    {
      "nombre": "Producto complementario sugerido",
      "razon": "Por qué es útil tenerlo"
    }
  ],
  "tips": [
    "Tip 1: Consejo específico para la ubicación/clima",
    "Tip 2: Consideración importante para instalación/uso",
    "Tip 3: Recomendación de mantenimiento según clima"
  ]
}

IMPORTANTE - REGLAS CRÍTICAS:
- ⚠️ USA ÚNICAMENTE información de las DESCRIPCIONES de productos. NO inventes especificaciones técnicas
- ⚠️ Si un producto NO menciona una característica en su descripción, NO asumas que la tiene
- ⚠️ Ejemplo: Si la descripción NO dice "IP67", NO recomiendes ese producto para uso exterior
- ⚠️ Sé HONESTO: Si ningún producto cumple con los requisitos, dilo claramente
- Menciona SIEMPRE aspectos relacionados al clima/ubicación del cliente
- Si el clima es húmedo/lluvioso: busca productos cuyas descripciones mencionen protección IP67/IP68, anti-corrosión
- Si es frío/altura: busca productos con rango de temperatura amplio en su descripción
- Si es caluroso/desértico: busca resistencia térmica y protección contra polvo en la descripción
- Si es costero: busca protección contra salitre y anti-corrosión mencionados en la descripción
- Si es selva: busca sellado hermético y resistencia a humedad en la descripción
- Sé específico citando características REALES de las descripciones
- Usa lenguaje técnico pero comprensible
- Prioriza productos que REALMENTE estén en la lista de disponibles
- Si la descripción está vacía, menciona que necesitas más información técnica del producto

Responde SOLO con el JSON, sin texto adicional antes ni después.`;
  }

  /**
   * Parsea la respuesta de Gemini AI a formato estructurado
   */
  private parseAIResponse(aiText: string): AIResponse {
    try {
      // Limpiar texto de posibles markdown o caracteres extra
      let cleanText = aiText.trim();

      // Remover bloques de código markdown si existen
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/g, '');
      }

      const parsed = JSON.parse(cleanText);

      // Validar estructura básica
      if (!parsed.recomendaciones) {
        parsed.recomendaciones = [];
      }
      if (!parsed.productosNoRecomendados) {
        parsed.productosNoRecomendados = [];
      }
      if (!parsed.productosComplementarios) {
        parsed.productosComplementarios = [];
      }
      if (!parsed.tips) {
        parsed.tips = [];
      }

      return parsed as AIResponse;
    } catch (error) {
      console.error('❌ [AI] Error parseando respuesta:', error);
      console.log('📄 [AI] Texto recibido:', aiText);

      // Fallback: respuesta de error amigable
      return {
        recomendaciones: [],
        productosNoRecomendados: [],
        productosComplementarios: [],
        tips: [
          'Hubo un problema al procesar la respuesta de la IA.',
          'Por favor, intenta reformular tu consulta o contacta a soporte.',
        ],
      };
    }
  }

  /**
   * Guarda log de recomendación para análisis posterior
   */
  private async logRecommendation(
    clienteId: string,
    consulta: string,
    respuesta: AIResponse
  ): Promise<void> {
    try {
      // Por ahora solo log en consola
      // TODO: Crear tabla AIRecommendationLog en el futuro
      console.log('📊 [AI] Log de recomendación:', {
        clienteId,
        consulta,
        productosRecomendados: respuesta.recomendaciones.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('⚠️ [AI] Error guardando log:', error);
      // No lanzar error para no afectar el flujo principal
    }
  }
}

// Exportar instancia única
export const aiRecommendationsService = new AIRecommendationsService();
