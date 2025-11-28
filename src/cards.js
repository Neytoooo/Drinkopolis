// src/cards.js

// Images des cartes (PNG fond transparent) — place-les dans assets/cards/
export const CARD_IMAGES = {
  SHIELD:            require("../assets/cards/bouclier.png"),            // Bouclier Anti-Cuite
  DOUBLE_ROLL:       require("../assets/cards/double.png"),              // Double shot inversé / double lancer visuel
  TELEPORT_PRISON:   require("../assets/cards/prison_express.png"),      // Prison Express
  CLEANSE:           require("../assets/cards/verre_renverse.png"),      // Verre Renversé
  CHANCE:            require("../assets/cards/chance.png"),              // Chance Insolente
  RETURN_START:      require("../assets/cards/retour_depart.png"),       // Retour à la case départ
  THIRST_CURSE:      require("../assets/cards/malediction_soif.png"),    // Malédiction de la soif
  DUEL:              require("../assets/cards/duel.png"),                // Duel de shots
};

// ————————— Cartes disponibles —————————
export const SPECIAL_CARDS = [
  // INSTANT
  { key:"GIVE_SHOT",      title:"+1 shot à un autre",   kind:"instant", desc:"Choisis un joueur : il boit 1 shot." },
  { key:"TAKE_SHOT",      title:"Tu bois 1 shot",       kind:"instant", desc:"Hydrate-toi... mais pas avec de l'eau." },
  { key:"GIVE_TAF",       title:"+1 taf à un autre",    kind:"instant", desc:"Choisis un joueur : +1 taf." },
  { key:"CLEANSE",        title:"Verre renversé",       kind:"instant", desc:"Retire 1 shot de ton compteur." },
  { key:"MOVE_3",         title:"+3 cases",             kind:"instant", desc:"Avance de 3 cases." },
  { key:"BACK_2",         title:"-2 cases",             kind:"instant", desc:"Recule de 2 cases." },
  { key:"TELEPORT_PRISON",title:"Prison express",       kind:"instant", desc:"Va directement en prison (1 tour + 1 shot)." },
  { key:"CHANCE",         title:"Chance insolente",     kind:"instant", desc:"Relance le dé et rajoute le meilleur." },

  // KEEP (à garder)
  { key:"SHIELD",         title:"Bouclier anti-cuite",  kind:"keep",    desc:"Annule la prochaine pénalité (shot/taf/prison)." },
  { key:"DOUBLE_ROLL",    title:"Double lancer",        kind:"keep",    desc:"Prochain tour : deux lancers, garde le meilleur." },
  { key:"RETURN_START",   title:"Retour à la case départ", kind:"keep", desc:"Utilise-la pour revenir au départ." },
  { key:"DUEL",           title:"Duel de shots",        kind:"keep",    desc:"Défie un joueur (au prochain tour)." },
];

// Deck mélangé (2 exemplaires de chaque)
export function buildShuffledDeck() {
  const arr = [...SPECIAL_CARDS, ...SPECIAL_CARDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const CARD_META = SPECIAL_CARDS.reduce((acc, c) => {
  acc[c.key] = c; return acc;
}, {});
