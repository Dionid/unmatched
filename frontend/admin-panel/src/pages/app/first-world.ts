import { World } from "@/pages/app/game";

export const defaultWorld: World = {
  t: "world",
  id: "1",
  currentPlayerId: "",
  playersById: {},
  cardsById: {},
  decksById: {},
  resourcesById: {},
  mapsById: {},
  charactersById: {},
};

export const firstWorld: World = {
  t: "world",
  id: "2d304c56-0361-47a4-8426-e4154f69ef6b",
  currentPlayerId: "d7c542af-1745-475f-86e6-1bba43ec8e56",
  cardsById: {
    "1": {
      t: "card",
      id: "1",
      name: "Jekyll & Hyde 1",
      frontImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/decks/eEYajsgspLNDHftUQoyh2.webp",
      backImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/card-covers/ALEF6sBXvEA3kUuJEb3gb.png",
      isFaceUp: true,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    "2": {
      t: "card",
      id: "2",
      name: "Jekyll & Hyde 2",
      frontImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/decks/-05aruis4rhEh7psaXnea.webp",
      backImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/card-covers/ALEF6sBXvEA3kUuJEb3gb.png",
      isFaceUp: true,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    "3": {
      t: "card",
      id: "3",
      name: "Jekyll & Hyde 3",
      frontImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/decks/kAt5fbRGnyOOoLbnH3IHj.webp",
      backImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/card-covers/ALEF6sBXvEA3kUuJEb3gb.png",
      isFaceUp: true,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    "4": {
      t: "card",
      id: "4",
      name: "Jekyll & Hyde 4",
      frontImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/decks/zCwYyB4XLQ5xfbAfUEAhk.webp",
      backImageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/card-covers/ALEF6sBXvEA3kUuJEb3gb.png",
      isFaceUp: false,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },
  decksById: {
    "1": {
      t: "deck",
      id: "1",
      name: "hand",
      cards: ["1", "2"],
      type: "hand",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    "2": {
      t: "deck",
      id: "2",
      name: "draw",
      cards: ["3"],
      type: "draw",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    "3": {
      t: "deck",
      id: "3",
      name: "discard",
      cards: ["4"],
      type: "discard",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    "e4a3facf-ad44-4dc3-ae4e-003a590f9f93": {
      t: "deck",
      id: "e4a3facf-ad44-4dc3-ae4e-003a590f9f93",
      name: "play",
      cards: [],
      type: "play",
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },
  resourcesById: {
    "1": {
      t: "resource",
      id: "1",
      name: "health",
      description: "Health is a resource that can be used to heal characters.",
      imageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/avatars/3G9V5x3JHXMZ4G5H3Kk7s.webp",
      value: 10,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },
  playersById: {
    "d7c542af-1745-475f-86e6-1bba43ec8e56": {
      t: "player",
      id: "d7c542af-1745-475f-86e6-1bba43ec8e56",
      name: "Player 1",
      decks: ["1", "2", "3", "e4a3facf-ad44-4dc3-ae4e-003a590f9f93"],
      cards: ["1", "2", "3", "4"],
      resources: ["1"],
      characters: ["1"],
    },
  },
  mapsById: {
    "1": {
      t: "map",
      id: "1",
      name: "Map 1",
      imageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/maps/vfc99EARx4kiqr6f4aiIc.webp",
      size: {
        width: `650px`,
        height: `400px`,
      },
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
  },
  charactersById: {
    "1": {
      t: "character",
      id: "1",
      name: "Jekyll",
      imageUri:
        "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/minis/NpoqqaDotShInZPyA0iGz.png",
      position: {
        x: 100,
        y: 100,
        z: 0,
      },
      size: {
        width: "120px",
        height: "150px",
      },
    },
  },
};
