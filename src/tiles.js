// Plateau 40 cases en anneau, ordre inspiré de ta liste
export const TILES = [
  { type: "DEPART", label: "Départ (quand tu passes : ton partenaire boit 1 shot)" }, // 0
  { type: "SOBRE", label: "Sobre" },
  { type: "SHOT1", label: "+1 Shot" },
  { type: "CARTE", label: "Carte spéciale" },
  { type: "SEXY", label: "Défi Sexy" },
  { type: "TAF1", label: "+1 Taf" },
  { type: "SOBRE", label: "Sobre" },
  { type: "FUN", label: "Défi Fun" },
  { type: "PRISON", label: "Prison (1 tour bloqué + 1 shot)" }, // <- index 8
  { type: "SHOT2", label: "+2 Shots" },
  { type: "SOBRE", label: "Sobre" },
  { type: "CARTE", label: "Carte spéciale" },
  { type: "FUN", label: "Défi Fun" },
  { type: "SHOT1", label: "+1 Shot" },
  { type: "TAF1", label: "+1 Taf" },
  { type: "SEXY", label: "Défi Sexy" },
  { type: "SOBRE", label: "Sobre" },
  { type: "CARTE", label: "Carte spéciale" },
  { type: "SHOT2", label: "+2 Shots" },
  { type: "PARC", label: "Parc gratuit (l’autre boit 1 shot)" },
  { type: "SOBRE", label: "Sobre" },
  { type: "FUN", label: "Défi Fun" },
  { type: "SHOT1", label: "+1 Shot" },
  { type: "TAF1", label: "+1 Taf" },
  { type: "CARTE", label: "Carte spéciale" },
  { type: "SEXY", label: "Défi Sexy" },
  { type: "SHOT2", label: "+2 Shots" },
  { type: "SOBRE", label: "Sobre" },
  { type: "FUN", label: "Défi Fun" },
  { type: "GO_PRISON", label: "Allez en prison (direct case 8)" }, // envoie à 8
  { type: "SHOT1", label: "+1 Shot" },
  { type: "TAF1", label: "+1 Taf" },
  { type: "CARTE", label: "Carte spéciale" },
  { type: "SEXY", label: "Défi Sexy" },
  { type: "SOBRE", label: "Sobre" },
  { type: "SHOT2", label: "+2 Shots" },
  { type: "FUN", label: "Défi Fun" },
  { type: "CARTE", label: "Carte spéciale" },
  { type: "SEXY", label: "Défi Sexy" },
  { type: "IMPOT", label: "Impôt sur le revenu → tu bois 2 shots" } // 39
].map((t, i) => ({ ...t, index: i }));

export const NEON_COLORS = {
  DEPART: "#00ff9d", // Vert alien
  SOBRE: "#00f3ff",  // Cyan électrique
  SHOT1: "#ff0055",  // Rose néon
  SHOT2: "#ff0000",  // Rouge pur
  TAF1: "#ffaa00",   // Orange ambre
  CARTE: "#bc13fe",  // Violet laser
  SEXY: "#ff00ff",   // Magenta
  FUN: "#ffff00",    // Jaune pur
  PRISON: "#6a00ff", // Indigo profond
  GO_PRISON: "#ffffff",
  PARC: "#00ff00",
  IMPOT: "#ff4444"
};
