import { World } from "@/lib/game";
import { useEffect, useState } from "react";
import { GameCard } from "./game-card";

const defaultWorld: World = {
  t: "world",
  id: "1",
  currentPlayerId: "1",
  playersById: {},
  cardsById: {},
  decksById: {},
  resourcesById: {},
};

export const Game = () => {
  const [world, setWorld] = useState<World>(defaultWorld);

  useEffect(() => {
    setWorld({
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
        },
        "2": {
          t: "deck",
          id: "2",
          name: "draw",
          cards: ["3"],
        },
        "3": {
          t: "deck",
          id: "3",
          name: "discard",
          cards: ["4"],
        },
        "4": {
          t: "deck",
          id: "4",
          name: "play",
          cards: [],
        },
      },
      resourcesById: {
        "1": {
          t: "resource",
          id: "1",
          name: "Health",
          description:
            "Health is a resource that can be used to heal characters.",
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
          decks: ["4", "1", "2", "3"],
          cards: ["1", "2", "3", "4"],
          resources: ["1"],
        },
      },
    });
  }, []);
  // Function to increment resource value
  const incrementResource = (resourceId: string) => {
    setWorld((prevWorld) => ({
      ...prevWorld,
      resourcesById: {
        ...prevWorld.resourcesById,
        [resourceId]: {
          ...prevWorld.resourcesById[resourceId],
          value: prevWorld.resourcesById[resourceId].value + 1,
        },
      },
    }));
  };

  // Function to decrement resource value
  const decrementResource = (resourceId: string) => {
    setWorld((prevWorld) => ({
      ...prevWorld,
      resourcesById: {
        ...prevWorld.resourcesById,
        [resourceId]: {
          ...prevWorld.resourcesById[resourceId],
          value: Math.max(0, prevWorld.resourcesById[resourceId].value - 1),
        },
      },
    }));
  };

  const flipCard = (cardId: string) => {
    setWorld((prevWorld) => ({
      ...prevWorld,
      cardsById: {
        ...prevWorld.cardsById,
        [cardId]: {
          ...prevWorld.cardsById[cardId],
          isFaceUp: !prevWorld.cardsById[cardId].isFaceUp,
        },
      },
    }));
  };

  const moveCardToDeck = (cardId: string, currentDeckId: string, targetDeckId: string) => {
    setWorld((prevWorld) => {
      // Find which deck currently contains this card
      if (currentDeckId === targetDeckId) return prevWorld;

      // Remove card from source deck
      const updatedDecks = {
        ...prevWorld.decksById,
        [currentDeckId]: {
          ...prevWorld.decksById[currentDeckId],
          cards: prevWorld.decksById[currentDeckId].cards.filter(id => id !== cardId)
        },
        // Add card to target deck
        [targetDeckId]: {
          ...prevWorld.decksById[targetDeckId],
          cards: [...prevWorld.decksById[targetDeckId].cards.filter(id => id !== cardId), cardId]
        }
      };

      return {
        ...prevWorld,
        decksById: updatedDecks
      };
    });
  };

  return (
    <div className="flex gap-4 p-6 w-full">
      <div className="flex flex-col gap-4">
        {Object.entries(world.playersById).map(([id, player]) => {
          return (
            <div key={id} className="flex gap-4 w-md">
              <h2 className="text-xl font-bold">{player.name}</h2>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Cards</h3>
                <div className="grid grid-cols-3 gap-2 w-120">
                  {player.cards.map((cardId) => {
                    return (
                      <GameCard
                        key={cardId}
                        frontImageUri={world.cardsById[cardId].frontImageUri}
                        backImageUri={world.cardsById[cardId].backImageUri}
                        name={world.cardsById[cardId].name}
                        isFaceUp={true}
                        disableMenu={true}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Resources</h3>
                <div className="flex flex-col gap-2">
                  {player.resources.map((resourceId) => {
                    return (
                      <div
                        key={resourceId}
                        className="flex flex-col text-center p-2 w-35"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <button
                            onClick={() => decrementResource(resourceId)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                          >
                            -
                          </button>
                          <p className="text-md font-bold min-w-[2rem]">
                            {world.resourcesById[resourceId].value}
                          </p>
                          <button
                            onClick={() => incrementResource(resourceId)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                        <img
                          className=""
                          src={world.resourcesById[resourceId].imageUri}
                        />
                        <h3 className="text-md font-bold">
                          {world.resourcesById[resourceId].name}
                        </h3>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">Decks</h3>
                <div className="flex flex-col gap-2">
                  {player.decks.map((deckId) => {
                    return (
                      <div key={deckId} className="flex flex-col p-2 w-35">
                        <h3 className="text-md font-bold">
                          {world.decksById[deckId].name}
                        </h3>
                        <div className="grid grid-cols-3 gap-2 w-120">
                          {world.decksById[deckId].cards.map((cardId) => {
                            return (
                              <GameCard
                                key={cardId}
                                frontImageUri={
                                  world.cardsById[cardId].frontImageUri
                                }
                                backImageUri={
                                  world.cardsById[cardId].backImageUri
                                }
                                name={world.cardsById[cardId].name}
                                isFaceUp={world.cardsById[cardId].isFaceUp}
                                onClick={() => flipCard(cardId)}
                                onFlip={() => flipCard(cardId)}
                                onMoveToDeck={(targetDeckId) => moveCardToDeck(cardId, deckId, targetDeckId)}
                                availableDecks={Object.entries(world.decksById).map(([id, deck]) => ({
                                  id,
                                  name: deck.name
                                }))}
                                currentDeckId={deckId}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AppLayout = () => {
  // # Last step: show success message
  return (
    <>
      <Game />
    </>
  );
};
