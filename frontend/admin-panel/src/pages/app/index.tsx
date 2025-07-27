import { DeckId, ResourceId, World } from "@/lib/game";
import { useEffect, useState } from "react";
import { GameDeck } from "./game-card";
import { defaultWorld, firstWorld } from "./first-world";

export type Settings = {
  deckSettings: Record<
    DeckId,
    {
      cardsPerRow?: number;
      cardWidth?: number;
      positionY?: "top" | "center" | "bottom";
      positionX?: "left" | "center" | "right";
    }
  >;
  resourceSettings: Record<
    ResourceId,
    {
      positionY?: "top" | "center" | "bottom";
      positionX?: "left" | "center" | "right";
    }
  >;
};

export const Game = () => {
  const [world, setWorld] = useState<World>(defaultWorld);
  const [settings, setSettings] = useState<Settings>({
    deckSettings: {
      "1": {
        positionY: "bottom",
        positionX: "center",
      },
      "2": {
        positionY: "bottom",
        positionX: "right",
      },
      "3": {
        positionY: "bottom",
        positionX: "left",
      },
      "4": {
        positionY: "center",
        positionX: "center",
      },
    },
    resourceSettings: {
      "1": {
        positionY: "center",
        positionX: "left",
      },
    },
  });

  useEffect(() => {
    setWorld(firstWorld);
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

  const moveCardToDeck = (
    cardId: string,
    currentDeckId: string,
    targetDeckId: string
  ) => {
    setWorld((prevWorld) => {
      // Find which deck currently contains this card
      if (currentDeckId === targetDeckId) return prevWorld;

      // Remove card from source deck
      const updatedDecks = {
        ...prevWorld.decksById,
        [currentDeckId]: {
          ...prevWorld.decksById[currentDeckId],
          cards: prevWorld.decksById[currentDeckId].cards.filter(
            (id) => id !== cardId
          ),
        },
        // Add card to target deck
        [targetDeckId]: {
          ...prevWorld.decksById[targetDeckId],
          cards: [
            ...prevWorld.decksById[targetDeckId].cards.filter(
              (id) => id !== cardId
            ),
            cardId,
          ],
        },
      };

      return {
        ...prevWorld,
        decksById: updatedDecks,
      };
    });
  };

  return (
    <div className="w-full h-full p-6 relative">
      <div className="flex flex-col gap-4">
        {Object.entries(world.playersById).map(([id, player]) => {
          return (
            <div key={id} className="flex gap-4 w-md">
              {/* <h2 className="text-xl font-bold">{player.name}</h2> */}
              {/* <div className="flex flex-col gap-2">
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
              </div> */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  {player.resources.map((resourceId) => {
                    const resourceSettings =
                      settings.resourceSettings[resourceId];

                    const className: string[] = ["fixed"];
                    const style: React.CSSProperties = {};

                    switch (resourceSettings.positionY) {
                      case "top":
                        className.push("top-0");
                        break;
                      case "bottom":
                        className.push("bottom-0");
                        break;
                      case "center":
                        className.push("top-1/2 -translate-y-1/2");
                        break;
                    }

                    switch (resourceSettings.positionX) {
                      case "left":
                        className.push("left-0");
                        break;
                      case "right":
                        className.push("right-0");
                        break;
                      case "center":
                        className.push("left-1/2 -translate-x-1/2");
                        break;
                    }

                    return (
                      <div
                        key={resourceId}
                        className={className.join(" ")}
                        style={style}
                      >
                        <div
                          key={resourceId}
                          className="flex flex-col text-center p-2 w-30"
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {player.decks.map((deckId) => {
                const deckSettings = settings.deckSettings[deckId];

                const className: string[] = [];
                const style: React.CSSProperties = {};

                if (deckSettings) {
                  className.push("fixed");

                  switch (deckSettings.positionY) {
                    case "top":
                      className.push("top-0");
                      break;
                    case "bottom":
                      // className.push("bottom-0")
                      style.bottom = "-30px";
                      break;
                    case "center":
                      className.push("top-1/2 -translate-y-1/2");
                      break;
                  }

                  switch (deckSettings.positionX) {
                    case "left":
                      className.push("left-0");
                      break;
                    case "right":
                      className.push("right-0");
                      break;
                    case "center":
                      className.push("left-1/2 -translate-x-1/2");
                      break;
                  }
                }

                return (
                  <div
                    key={deckId}
                    className={className.join(" ")}
                    style={style}
                  >
                    <h3 className="text-lg font-bold text-center">
                      {world.decksById[deckId].name}
                    </h3>
                    <GameDeck
                      deck={world.decksById[deckId]}
                      allDecks={Object.values(world.decksById)}
                      cardsById={world.cardsById}
                      flipCard={flipCard}
                      moveCardToDeck={moveCardToDeck}
                    />
                  </div>
                );
              })}
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
