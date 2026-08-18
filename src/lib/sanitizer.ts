export interface PreCleanResult {
  cleanedText: string;
  extractedUrl: string | null;
  extractedLinkedinUrl: string | null;
  detectedCompany: string | null;
  logs: string[];
}

// Lista de empresas comúnmente reconocidas para auto-detección
const KNOWN_COMPANIES: { [key: string]: RegExp } = {
  IBM: /\b(ibm|ibm z|ibm ambassador|ibm cloud)\b/i,
  Santander: /\b(santander|banco santander|becas santander)\b/i,
  Google: /\b(google|google cloud|gcp|gdsc)\b/i,
  Microsoft: /\b(microsoft|azure|msft|github)\b/i,
  AWS: /\b(aws|amazon web services|amazon)\b/i,
  Oracle: /\b(oracle|java)\b/i,
  Meta: /\b(meta|facebook)\b/i,
  Cisco: /\b(cisco|networking academy)\b/i,
  Huawei: /\b(huawei|ict competition)\b/i,
  UNAM: /\b(unam|fes acatlán|acatlán|sea acatlán)\b/i,
};

/**
 * Realiza una pre-limpieza del texto de entrada, eliminando caracteres de control problemáticos
 * y extrayendo enlaces y la empresa de forma automática.
 */
export function performPreClean(
  rawText: string,
  existingUrl?: string,
  existingLinkedinUrl?: string,
  existingCompany?: string
): PreCleanResult {
  const logs: string[] = [];
  logs.push("🧹 Iniciando pre-limpieza y análisis automático en el cliente...");

  if (!rawText.trim()) {
    return {
      cleanedText: "",
      extractedUrl: existingUrl || null,
      extractedLinkedinUrl: existingLinkedinUrl || null,
      detectedCompany: existingCompany || null,
      logs: ["⚠️ El texto ingresado está vacío."],
    };
  }

  // 1. Limpieza básica de caracteres
  let cleanedText = rawText
    .replace(/[\r]/g, "") // Eliminar saltos de línea de Windows
    .replace(/[\t]+/g, " ") // Reemplazar tabulaciones por espacios
    .replace(/[ \t]{2,}/g, " ") // Colapsar múltiples espacios horizontales
    .trim();

  logs.push("✨ Texto sanitizado (saltos de línea normalizados y espacios corregidos).");

  // 2. Extraer Enlace de LinkedIn si está presente en el texto
  let linkedinUrl = existingLinkedinUrl?.trim() || null;
  const linkedinRegex = /https?:\/\/(?:www\.)?linkedin\.com\/(?:feed\/update\/|posts\/|in\/|company\/)[^\s\n"'>]+/gi;
  const linkedinMatch = cleanedText.match(linkedinRegex);

  if (linkedinMatch && linkedinMatch.length > 0) {
    const foundLinkedin = linkedinMatch[0].replace(/[.,;)]+$/, "");
    if (!linkedinUrl) {
      linkedinUrl = foundLinkedin;
      logs.push(`🔗 URL de LinkedIn detectada automáticamente: ${linkedinUrl}`);
    }
  }

  // 3. Extraer Enlace Destino (URL general que NO sea de LinkedIn)
  let destinationUrl = existingUrl?.trim() || null;
  const generalUrlRegex = /https?:\/\/[^\s\n"'>]+/gi;
  const allUrls = cleanedText.match(generalUrlRegex) || [];

  const nonLinkedinUrls = allUrls.filter(
    (u) => !u.toLowerCase().includes("linkedin.com")
  );

  if (nonLinkedinUrls.length > 0 && !destinationUrl) {
    destinationUrl = nonLinkedinUrls[0].replace(/[.,;)]+$/, "");
    logs.push(`🎯 URL de destino detectada automáticamente: ${destinationUrl}`);
  }

  // 4. Auto-detectar Empresa
  let company = existingCompany?.trim() || null;
  if (!company) {
    for (const [compName, pattern] of Object.entries(KNOWN_COMPANIES)) {
      if (pattern.test(cleanedText)) {
        company = compName;
        logs.push(`🏢 Empresa identificada automáticamente: ${company}`);
        break;
      }
    }
  }

  if (!company && destinationUrl) {
    try {
      const hostname = new URL(destinationUrl).hostname.replace("www.", "");
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        const domainName = parts[parts.length - 2];
        if (domainName.length > 2) {
          company = domainName.charAt(0).toUpperCase() + domainName.slice(1);
          logs.push(`🌐 Empresa inferida del dominio URL: ${company}`);
        }
      }
    } catch {
      // Ignorar error de parsing de URL
    }
  }

  return {
    cleanedText,
    extractedUrl: destinationUrl,
    extractedLinkedinUrl: linkedinUrl,
    detectedCompany: company,
    logs,
  };
}
