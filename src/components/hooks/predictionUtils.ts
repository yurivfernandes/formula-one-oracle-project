
/**
 * Utilidades compartilhadas para análise de predição dinâmica F1 2025
 */

// Pontos F1 padrão por posição
export const F1_POINTS_PER_POSITION = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// Determina se há evento de upgrade relevante na corrida (por round)
export function isUpgradeEvent(round: number, upgradeRounds: number[]) {
  return upgradeRounds.includes(round);
}

// Média aritmética
export const mean = (v: number[]) => v.length === 0 ? 0 : v.reduce((a, b) => a + b, 0) / v.length;

// Soma total
export const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);

