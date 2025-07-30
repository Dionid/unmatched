import { World } from "@/pages/app/game";

export const defaultWorld: World = {
  t: "world",
  id: "1",
  currentPlayerId: "1",
  playersById: {},
  cardsById: {},
  decksById: {},
  resourcesById: {},
  playzonesById: {},
};

export const firstWorld: World = {
  t: "world",
  id: "1",
  currentPlayerId: "1",
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
    },
  },
  decksById: {
    "1": {
      t: "deck",
      id: "1",
      name: "hand",
      cards: ["1", "2"],
      type: "hand",
    },
    "2": {
      t: "deck",
      id: "2",
      name: "draw",
      cards: ["3"],
      type: "draw",
    },
    "3": {
      t: "deck",
      id: "3",
      name: "discard",
      cards: ["4"],
      type: "discard",
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
    },
  },
  playersById: {
    "1": {
      t: "player",
      id: "1",
      name: "Player 1",
      decks: ["1", "2", "3"],
      cards: ["1", "2", "3", "4"],
      resources: ["1"],
    },
  },
  playzonesById: {
    "1": {
      t: "playzone",
      id: "1",
      items: [],
      size: {
        width: `300px`,
        height: `200px`,
      },
      position: {
        x: 100,
        y: 100,
        z: 0,
      },
    },
  },
};
