// === Cases du plateau ===
export const IMAGES = {
  SOBRE:  require("../assets/tiles/sobre.png"),
  SHOT1:  require("../assets/tiles/shot_plus_1.png"),
  SHOT2:  require("../assets/tiles/shots_plus_2.png"),
  TAF1:   require("../assets/tiles/taf_plus_1.png"),
  CARTE:  require("../assets/tiles/carte_speciale.png"),
  SEXY:   require("../assets/tiles/defis_sexy.png"),
  FUN:    require("../assets/tiles/defis_fun.png"),
  PRISON: require("../assets/tiles/prison.png"),
  // placeholders si pas encore fournis
  DEPART: null,
  GO_PRISON: null,
  PARC: null,
  IMPOT: null
};

// === Skins de pions ===
export const PAWN_SKINS = {
  dealer: require("../assets/pawns/pawn_dealer.png"),
  kid:    require("../assets/pawns/pawn_kid.png"),
  leaf:   require("../assets/pawns/pawn_leaf.png"),
};

export const PAWN_SKIN_LIST = [
  { key: "dealer", label: "Dealer", src: PAWN_SKINS.dealer },
  { key: "kid",    label: "Mec",    src: PAWN_SKINS.kid },
  { key: "leaf",   label: "Leaf",   src: PAWN_SKINS.leaf },
];
