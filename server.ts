import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "No se encontró una clave GEMINI_API_KEY válida. Verifica Settings > Secrets en AI Studio."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const AUDIT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    resumenEjecutivo: {
      type: Type.STRING,
      description:
        "Síntesis ejecutiva del perfil jurídico de la organización bajo el ordenamiento colombiano y alcance de la auditoría.",
    },
    supuestosYAlertasVerificacion: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Lista de supuestos jurídicos o alertas de verificación cuando falten variables críticas (activos, ingresos en UVT/SMMLV, número exacto de empleados, municipio o código CIIU).",
    },
    areas: {
      type: Type.ARRAY,
      description:
        "Exactamente las 5 áreas funcionales requeridas en orden: 1) Constitución / Societario, 2) Talento Humano y SST, 3) Contratación y Consumidor, 4) Producto / Propiedad Intelectual / Ambiental, 5) Contabilidad / Tributario / Prevención de Lavado de Activos.",
      items: {
        type: Type.OBJECT,
        properties: {
          areaNombre: {
            type: Type.STRING,
            description: "Nombre exacto del área funcional.",
          },
          justificacionArea: {
            type: Type.STRING,
            description:
              "Breve justificación técnica de cómo las variables de la empresa determinan el régimen aplicable en esta área.",
          },
          filas: {
            type: Type.ARRAY,
            description:
              "Entre 3 y 5 obligaciones normativas específicas y pertinentes para esta empresa en el área funcional.",
            items: {
              type: Type.OBJECT,
              properties: {
                areaProceso: {
                  type: Type.STRING,
                  description: "Columna 1: Área / Proceso específico dentro del área funcional.",
                },
                normaAplicable: {
                  type: Type.STRING,
                  description:
                    "Columna 2: Norma Aplicable exacta en Colombia (Ley, Decreto Único Reglamentario, Resolución o Circular Externa vigente).",
                },
                obligacionEspecifica: {
                  type: Type.STRING,
                  description:
                    "Columna 3: Obligación específica para la empresa, incluyendo una breve justificación de por qué aplica según los datos ingresados.",
                },
                entidadVigilanteIVC: {
                  type: Type.STRING,
                  description:
                    "Columna 4: Entidad de Inspección, Vigilancia y Control (IVC) competente en Colombia.",
                },
                riesgoYSancion: {
                  type: Type.STRING,
                  description:
                    "Columna 5: Riesgo y sanción legal, pecuniaria (expresada en UVT o SMMLV) o administrativa derivada de su incumplimiento.",
                },
                nivelRiesgo: {
                  type: Type.STRING,
                  description: "Nivel de riesgo jurídico: CRÍTICO, ALTO o MEDIO.",
                },
              },
              required: [
                "areaProceso",
                "normaAplicable",
                "obligacionEspecifica",
                "entidadVigilanteIVC",
                "riesgoYSancion",
                "nivelRiesgo",
              ],
            },
          },
        },
        required: ["areaNombre", "justificacionArea", "filas"],
      },
    },
    alertasCriticas: {
      type: Type.ARRAY,
      description:
        "Exactamente 3 brechas legales de prioridad inmediata con mayor riesgo de cierre, multas cuantiosas o responsabilidad solidaria para los administradores.",
      items: {
        type: Type.OBJECT,
        properties: {
          titulo: { type: Type.STRING },
          areaAfectada: { type: Type.STRING },
          normaVulnerada: { type: Type.STRING },
          impactoYSancion: {
            type: Type.STRING,
            description:
              "Detalle del riesgo de cierre, monto de multa en UVT/SMMLV o alcance de responsabilidad solidaria de administradores/representante legal.",
          },
          accionInmediata: {
            type: Type.STRING,
            description: "Plan de choque concreto para mitigar la brecha.",
          },
        },
        required: [
          "titulo",
          "areaAfectada",
          "normaVulnerada",
          "impactoYSancion",
          "accionInmediata",
        ],
      },
    },
    resumenClasificacionPortafolio: {
      type: Type.STRING,
      description:
        "Visión jurídica general del portafolio de productos o servicios frente al ordenamiento jurídico colombiano.",
    },
    analisisProductosServicios: {
      type: Type.ARRAY,
      description:
        "Si el usuario suministró un listado de productos o servicios, análisis jurídico profundo para cada ítem identificando qué normas colombianas lo cobijan.",
      items: {
        type: Type.OBJECT,
        properties: {
          productoServicio: {
            type: Type.STRING,
            description: "Nombre del producto o servicio evaluado.",
          },
          clasificacionJuridica: {
            type: Type.STRING,
            description:
              "Naturaleza o categorización legal en Colombia (ej. bien de consumo masivo, alimento/cosmético sujeto a vigilancia sanitaria, servicio financiero/solidario, obra de software protegida por derecho de autor, servicio educativo informal).",
          },
          normasQueLoCobijan: {
            type: Type.STRING,
            description:
              "Leyes, Decretos Únicos Reglamentarios, Resoluciones técnicas y Circulares colombianas exactas que regulan este producto o servicio.",
          },
          requisitosHabilitantes: {
            type: Type.STRING,
            description:
              "Permisos, registros sanitarios (INVIMA/ICA), licencias, rotulado, garantías mínimas, pólizas o habilitaciones obligatorias.",
          },
          entidadReguladora: {
            type: Type.STRING,
            description:
              "Entidad IVC competente sobre este producto o servicio (SIC, INVIMA, MinEducación, Supersolidaria, Superfinanciera, DIAN, MinTIC, etc.).",
          },
          analisisJuridicoProfundo: {
            type: Type.STRING,
            description:
              "Respuesta jurídica profunda detallando alcance legal, restricciones de comercialización o prestación, régimen de responsabilidad, implicaciones de IVA/tributarias si aplican y riesgos de sanción.",
          },
        },
        required: [
          "productoServicio",
          "clasificacionJuridica",
          "normasQueLoCobijan",
          "requisitosHabilitantes",
          "entidadReguladora",
          "analisisJuridicoProfundo",
        ],
      },
    },
    respuestaConsultaEspecifica: {
      type: Type.STRING,
      description:
        "Si el usuario formuló una consulta legal específica, responderla con rigor normativo colombiano. Si no formuló ninguna, invitarle formalmente a indicar qué información legal específica adicional requiere para su organización, sugiriendo 2-3 temas clave según su perfil.",
    },
  },
  required: [
    "resumenEjecutivo",
    "supuestosYAlertasVerificacion",
    "areas",
    "alertasCriticas",
    "respuestaConsultaEspecifica",
  ],
};

const PRODUCTS_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    resumenClasificacionPortafolio: {
      type: Type.STRING,
      description:
        "Síntesis jurídica integral del portafolio de productos y servicios de la organización frente a la regulación colombiana vigente.",
    },
    analisisProductosServicios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productoServicio: { type: Type.STRING },
          clasificacionJuridica: { type: Type.STRING },
          normasQueLoCobijan: { type: Type.STRING },
          requisitosHabilitantes: { type: Type.STRING },
          entidadReguladora: { type: Type.STRING },
          analisisJuridicoProfundo: { type: Type.STRING },
        },
        required: [
          "productoServicio",
          "clasificacionJuridica",
          "normasQueLoCobijan",
          "requisitosHabilitantes",
          "entidadReguladora",
          "analisisJuridicoProfundo",
        ],
      },
    },
  },
  required: ["resumenClasificacionPortafolio", "analisisProductosServicios"],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  app.post("/api/audit/generate", async (req: Request, res: Response) => {
    try {
      const { profile } = req.body ?? {};
      if (!profile || !profile.tipoOrganizacion) {
        res.status(400).json({
          error: "Faltan los datos básicos del perfil de la organización.",
        });
        return;
      }

      const ai = getAiClient();

      const systemInstruction = `Actúa como un Auditor Legal Corporativo y Oficial de Cumplimiento (Compliance Officer) experto en el ordenamiento jurídico de la República de Colombia.

INSTRUCCIONES DE ANÁLISIS ESTRICTO:
1. Evalúa exactamente estas 5 áreas funcionales:
   - "Constitución / Societario"
   - "Talento Humano y SST"
   - "Contratación y Consumidor"
   - "Producto / Propiedad Intelectual / Ambiental"
   - "Contabilidad / Tributario / Prevención de Lavado de Activos"
2. Cruza las variables específicas de la empresa (naturaleza jurídica: micro, pequeña, mediana, gran empresa, cooperativa, fundación, corporación u ONG; CIIU; número de empleados y contratistas; municipio; ingresos/activos; tipo de cliente y factores operativos) contra la legislación colombiana vigente (Leyes, Decretos Únicos Reglamentarios, Resoluciones y Circulares Externas de Superintendencias como SuperSociedades, Supersolidaria, SIC, DIAN, Mintrabajo, UGPP, INVIMA, Alcaldías).
3. No incluyas normas genéricas que no apliquen al perfil descrito. En cada fila, dentro de "obligacionEspecifica", justifica brevemente por qué la norma aplica según los datos ingresados (por ejemplo: por ser ESAL, cooperativa, tener >=10 trabajadores, operar en Bogotá, vender a consumidores finales B2C, superar topes en UVT/SMMLV, etc.).
4. Para cada obligación normativa, identifica la entidad de inspección, vigilancia y control (IVC) competente y detalla las sanciones legales, pecuniarias (en UVT o SMMLV) o administrativas (cierre, suspensión, cancelación de personería, responsabilidad solidaria) derivadas de su incumplimiento.
5. Mantén estricto rigor jurídico. Si una variable crítica (ej. ingresos/activos, municipio, CIIU o número de empleados) no fue especificada, indícalo explícitamente en "supuestosYAlertasVerificacion" como un supuesto o alerta de verificación.
6. En "alertasCriticas", entrega exactamente las 3 brechas legales que representan el mayor riesgo de cierre del establecimiento, multas cuantiosas o responsabilidad solidaria para los administradores / representante legal / miembros de consejo o junta.
7. Si el perfil incluye un listado en "productosServicios" (o si se deduce claramente de la actividad económica), realiza un análisis jurídico de cada producto o servicio en "analisisProductosServicios" y "resumenClasificacionPortafolio", identificando qué normas colombianas exactas lo cobijan, requisitos habilitantes, entidad reguladora y respuesta jurídica profunda.
8. En "respuestaConsultaEspecifica", responde la inquietud particular si el usuario la envió; si está vacía, solicita al usuario si requiere alguna información legal específica que aplique a su organización sugiriendo focos críticos de su perfil.
9. El nivelRiesgo de cada fila debe ser estrictamente uno de: "CRÍTICO", "ALTO" o "MEDIO".`;

      const userPrompt = `DATOS DE ENTRADA DE LA ORGANIZACIÓN (JSON):
${JSON.stringify(profile, null, 2)}

Genera la Matriz de Requisitos Legales y Riesgos de Incumplimiento completa y rigurosa para este perfil en Colombia.`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: AUDIT_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        res.status(502).json({
          error: "El motor de análisis no devolvió contenido estructurado.",
        });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      console.error("Error en /api/audit/generate:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Error inesperado generando la auditoría legal.";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/audit/products-analysis", async (req: Request, res: Response) => {
    try {
      const { profile, productosServicios } = req.body ?? {};
      if (
        !profile ||
        !Array.isArray(productosServicios) ||
        productosServicios.length === 0
      ) {
        res.status(400).json({
          error:
            "Debes ingresar al menos un producto o servicio para realizar el análisis jurídico profundo.",
        });
        return;
      }

      const ai = getAiClient();

      const systemInstruction = `Actúa como Auditor Legal Corporativo y Oficial de Cumplimiento (Compliance Officer) experto en la República de Colombia.
Tu tarea es realizar un ANÁLISIS JURÍDICO PROFUNDO sobre el listado de productos y servicios que ofrece la organización, determinando desde la visión jurídica colombiana qué normas exactas cobijan a cada uno.

REGLAS DE ANÁLISIS PROFUNDO:
1. Analiza uno por uno todos los productos o servicios listados, sin omitir ninguno.
2. Clasifica jurídicamente cada producto o servicio bajo el derecho colombiano (ej. bien de consumo ordinario vs. producto regulado por reglamento técnico o registro sanitario; obra protegida por derecho de autor; servicio financiero/solidario; servicio educativo formal/informal/ETDH; servicio profesional o B2B; operación de comercio electrónico).
3. Cita con precisión las Leyes, Decretos Únicos Reglamentarios (DUR 1074/2015, DUR 1072/2015, DUR 1076/2015, DUR 1075/2015, DUR 1625/2016, etc.), Resoluciones (INVIMA, SIC, MinSalud, MinTIC, MinAmbiente) y Circulares Externas aplicables.
4. Detalla los requisitos habilitantes obligatorios (registros sanitarios, notificación sanitaria, etiquetado/rotulado, derecho de retracto, garantía legal, licencias, registro de marca/software, permisos municipales o ambientales).
5. Identifica la entidad de Inspección, Vigilancia y Control (IVC) competente y entrega en "analisisJuridicoProfundo" una respuesta jurídica completa con implicaciones regulatorias, tributarias (ej. exclusión/exención de IVA o retención si aplica al perfil) y riesgos de sanción en UVT o SMMLV.`;

      const userPrompt = `PERFIL DE LA ORGANIZACIÓN:
${JSON.stringify(profile, null, 2)}

LISTADO DE PRODUCTOS O SERVICIOS A ANALIZAR EN PROFUNDIDAD:
${productosServicios.map((p: string, idx: number) => `${idx + 1}. ${p}`).join("\n")}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: PRODUCTS_ANALYSIS_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      const rawText = response.text?.trim();
      if (!rawText) {
        res.status(502).json({
          error: "El motor jurídico no devolvió el análisis de productos y servicios.",
        });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json(parsed);
    } catch (err: unknown) {
      console.error("Error en /api/audit/products-analysis:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Error inesperado ejecutando el análisis jurídico de productos y servicios.";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/audit/followup", async (req: Request, res: Response) => {
    try {
      const { profile, summary, question, history } = req.body ?? {};
      if (!profile || !question || typeof question !== "string") {
        res.status(400).json({
          error: "Se requiere el perfil de la organización y la consulta legal específica.",
        });
        return;
      }

      const ai = getAiClient();

      const systemInstruction = `Actúa como Auditor Legal Corporativo y Oficial de Cumplimiento experto en la República de Colombia.
Responde consultas jurídicas específicas del usuario aplicadas estrictamente al perfil organizacional suministrado.
Reglas:
- Cita con exactitud las Leyes, Decretos Únicos Reglamentarios, Resoluciones o Circulares Externas colombianas aplicables.
- Indica qué entidad ejerce Inspección, Vigilancia y Control (IVC) y las sanciones o riesgos en UVT/SMMLV si corresponde.
- Si faltan datos concretos de la empresa para dar una respuesta definitiva (ej. monto exacto de ingresos brutos o activos a 31 de diciembre), indícalo como alerta de verificación.
- Responde en español jurídico claro, estructurado en párrafos cortos y viñetas prácticas accionables.`;

      const historyText = Array.isArray(history) && history.length > 0
        ? `\nCONSULTAS PREVIAS:\n${history
            .slice(-4)
            .map((h: { question: string; answer: string }) => `P: ${h.question}\nR: ${h.answer}`)
            .join("\n\n")}`
        : "";

      const prompt = `PERFIL DE LA ORGANIZACIÓN:
${JSON.stringify(profile, null, 2)}

RESUMEN DE LA AUDITORÍA ACTUAL:
${summary || "Sin resumen"}
${historyText}

CONSULTA LEGAL ESPECÍFICA DEL USUARIO:
${question}`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const answer = response.text?.trim();
      if (!answer) {
        res.status(502).json({
          error: "No se pudo obtener respuesta para la consulta específica.",
        });
        return;
      }

      res.json({ answer });
    } catch (err: unknown) {
      console.error("Error en /api/audit/followup:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Error inesperado procesando la consulta legal específica.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LexMatríz Colombia corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
