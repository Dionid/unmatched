import { DeckId, ResourceId, World } from "@/pages/app/game";
import { useEffect, useState, useRef } from "react";
import { GameDeck } from "./game-card";
import { defaultWorld, firstWorld } from "./first-world";

export type Settings = {
  deckSettings: Record<
    DeckId,
    {
      cardsPerRow?: number;
      cardWidth?: number;
      positionY?: string;
      positionX?: string;
    }
  >;
  resourceSettings: Record<
    ResourceId,
    {
      positionX?: string;
      positionY?: string;
    }
  >;
};

export const Game = () => {
  const [world, setWorld] = useState<World>(defaultWorld);
  const [settings, setSettings] = useState<Settings>({
    deckSettings: {
      "1": {
        positionX: `${window.innerWidth / 2 - 100}px`,
        positionY: `${window.innerHeight - 200}px`,
      },
      "2": {
        positionX: `${window.innerWidth - 150}px`,
        positionY: `${window.innerHeight - 200}px`,
      },
      "3": {
        positionX: `${20}px`,
        positionY: `${window.innerHeight - 200}px`,
      },
    },
    resourceSettings: {
      "1": {
        positionX: `${20}px`,
        positionY: `${50}px`,
      },
    },
  });

  // Drag state management
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'resource' | 'deck' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

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

  // Function to update resource position
  const updateResourcePosition = (resourceId: string, x: number, y: number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      resourceSettings: {
        ...prevSettings.resourceSettings,
        [resourceId]: {
          ...prevSettings.resourceSettings[resourceId],
          positionX: `${x}px`,
          positionY: `${y}px`,
        },
      },
    }));
  };

  // Function to update deck position
  const updateDeckPosition = (deckId: string, x: number, y: number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      deckSettings: {
        ...prevSettings.deckSettings,
        [deckId]: {
          ...prevSettings.deckSettings[deckId],
          positionX: `${x}px`,
          positionY: `${y}px`,
        },
      },
    }));
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'resource' | 'deck') => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(id);
    setDragType(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragType) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    if (dragType === 'resource') {
      updateResourcePosition(isDragging, newX, newY);
    } else if (dragType === 'deck') {
      updateDeckPosition(isDragging, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setDragType(null);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, dragType]);

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

  // Function to take top card from a deck and move it to another deck
  const takeTopCard = (sourceDeckId: string, targetDeckId: string) => {
    setWorld((prevWorld) => {
      const sourceDeck = prevWorld.decksById[sourceDeckId];
      if (!sourceDeck || sourceDeck.cards.length === 0) return prevWorld;

      const topCardId = sourceDeck.cards[sourceDeck.cards.length - 1]; // Get the top card

      // Remove top card from source deck
      const updatedDecks = {
        ...prevWorld.decksById,
        [sourceDeckId]: {
          ...sourceDeck,
          cards: sourceDeck.cards.slice(0, -1), // Remove the last card
        },
        // Add top card to target deck
        [targetDeckId]: {
          ...prevWorld.decksById[targetDeckId],
          cards: [
            ...prevWorld.decksById[targetDeckId].cards,
            topCardId,
          ],
        },
      };

      return {
        ...prevWorld,
        decksById: updatedDecks,
      };
    });
  };

  // Function to shuffle a deck
  const shuffleDeck = (deckId: string) => {
    setWorld((prevWorld) => {
      const deck = prevWorld.decksById[deckId];
      if (!deck || deck.cards.length === 0) return prevWorld;

      // Create a copy of the cards array and shuffle it
      const shuffledCards = [...deck.cards];
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
      }

      return {
        ...prevWorld,
        decksById: {
          ...prevWorld.decksById,
          [deckId]: {
            ...deck,
            cards: shuffledCards,
          },
        },
      };
    });
  };

  return (
    <div 
      className="w-full h-full p-6 relative"
    >
      <div className="flex flex-col gap-4">
        {Object.entries(world.playersById).map(([id, player]) => {
          return (
            <div key={id} className="flex gap-4 w-md">
              {player.resources.map((resourceId) => {
                const resourceSettings = settings.resourceSettings[resourceId];

                const className: string[] = ["fixed bg-gray-300 rounded-md"];
                const style: React.CSSProperties = {};

                style.left = resourceSettings.positionX;
                style.top = resourceSettings.positionY;

                return (
                  <div
                    key={resourceId}
                    className={className.join(" ")}
                    style={style}
                    ref={dragRef}
                  >
                    {/* Drag handle with dots icon */}
                    <div 
                      className="absolute top-0 left-0 w-6 h-6 rounded-tl-md cursor-move flex items-center justify-center hover:bg-gray-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, resourceId, 'resource')}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      key={resourceId}
                      className="flex flex-col w-30"
                    >
                      <div className="flex items-center justify-center bg-gray-100 rounded-t-md">
                        <h3 className="text-md font-semibold">
                          {world.resourcesById[resourceId].name}
                        </h3>
                      </div>

                      <div className="p-4 pt-2">
                        <img
                          className="rounded-[50%] mt-2"
                          src={world.resourcesById[resourceId].imageUri}
                        />
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <button
                            onClick={() => decrementResource(resourceId)}
                            className="bg-white rounded-md w-6 h-6 flex items-center justify-center text-lg font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <p className="text-md font-bold min-w-[1.5rem]">
                            {world.resourcesById[resourceId].value}
                          </p>
                          <button
                            onClick={() => incrementResource(resourceId)}
                            className="bg-white rounded-md w-6 h-6 flex items-center justify-center text-lg font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {player.decks.map((deckId) => {
                const deckSettings = settings.deckSettings[deckId];

                const className: string[] = ["fixed bg-gray-100 rounded-md shadow-md"];
                const style: React.CSSProperties = {};

                if (deckSettings) {
                  style.left = deckSettings.positionX;
                  style.top = deckSettings.positionY;
                }

                return (
                  <div
                    key={deckId}
                    className={className.join(" ")}
                    style={style}
                    ref={dragRef}
                  >
                    {/* Drag handle with dots icon */}
                    <div 
                      className="absolute top-0 left-0 w-8 h-6 rounded-tl-md cursor-move flex items-center justify-center hover:bg-gray-400 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, deckId, 'deck')}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    <GameDeck
                      deck={world.decksById[deckId]}
                      allDecks={Object.values(world.decksById)}
                      cardsById={world.cardsById}
                      flipCard={flipCard}
                      moveCardToDeck={moveCardToDeck}
                      onTakeTopCard={takeTopCard}
                      onShuffle={shuffleDeck}
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
