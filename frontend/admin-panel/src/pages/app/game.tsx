export type CardId = string;
export type DeckId = string;
export type ResourceId = string;
export type PlayerId = string;
export type WorldId = string;
export type MapId = string;
export type ComponentId = string;
export type PlayzoneId = string;
export type PlayzoneItemId = string;

export type Size = {
    width: string;
    height: string;
}

export type Position = {
    x: number;
    y: number;
    z: number;
}

export type Card = {
    t: 'card';
    id: CardId;
    name: string;
    frontImageUri: string;
    backImageUri: string;
    isFaceUp: boolean;
    position: Position;
}

export type Resource = {
    t: 'resource';
    id: ResourceId;
    name: string;
    description: string;
    imageUri: string;
    value: number;
    position: Position;
}

// export type CharacterBundle = {
//     t: 'characterBundle';
//     id: CharacterBundleId;
//     characters: CharacterId[];
//     cards: CardId[];
//     resources: ResourceId[];
// }

export type Deck = {
    t: 'deck';
    id: DeckId;
    name: string;
    cards: CardId[];
    type: "hand" | "discard" | "draw" | "play";
    position: Position;
}

export type Player = {
    t: 'player';
    id: PlayerId;
    name: string;

    // # Ingame
    decks: DeckId[];
    cards: CardId[];
    resources: ResourceId[];
}

export type Map = {
    t: 'map';
    id: MapId;
    name: string;
    imageUri: string;
    position: Position;
    size: Size;
}

// # Current game world with all data
export type World = {
    t: 'world';
    id: WorldId;
    currentPlayerId: PlayerId;

    playersById: Record<PlayerId, Player>;

    cardsById: Record<CardId, Card>;
    decksById: Record<DeckId, Deck>;
    resourcesById: Record<ResourceId, Resource>;
    mapsById: Record<MapId, Map>;
}
