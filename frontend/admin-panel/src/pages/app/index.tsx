import { DeckId, ResourceId, World } from "@/pages/app/game";
import { useEffect, useState, useRef } from "react";
import { GameDeck, GamePlayzone, GameResource } from "./game-card";
import { defaultWorld, firstWorld } from "./first-world";
import { DragHandle } from "./additional";

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

  // Drag state management
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'resource' | 'deck' | 'playzone' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const changedWorld = {
      ...firstWorld,
      resourcesById: {
        ...firstWorld.resourcesById,
        "1": {
          ...firstWorld.resourcesById["1"],
          position: { x: 20, y: 20, z: 0 },
        },
      },
      decksById: {
        ...firstWorld.decksById,
        "1": {
          ...firstWorld.decksById["1"],
          position: { x: window.innerWidth / 2 - 100, y: window.innerHeight - 200, z: 0 },
        },
        "2": {
          ...firstWorld.decksById["2"],
          position: { x: window.innerWidth - 190, y: window.innerHeight - 200, z: 0 },
        },
        "3": {
          ...firstWorld.decksById["3"],
          position: { x: 20, y: window.innerHeight - 200, z: 0 },
        },
      },
      playzonesById: {
        ...firstWorld.playzonesById,
        "1": {
          ...firstWorld.playzonesById["1"],
          position: { x: window.innerWidth / 2 - 100, y: 50, z: 0 },
        },
      },
    };

    setWorld(changedWorld);
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
    setWorld((prevWorld) => {
      const resource = prevWorld.resourcesById[resourceId];
      if (!resource) return prevWorld;

      return {
        ...prevWorld,
        resourcesById: {
          ...prevWorld.resourcesById,
          [resourceId]: {
            ...resource,
            position: { x, y, z: resource.position.z },
          },
        },
      }
    });
  };

  // Function to update deck position
  const updateDeckPosition = (deckId: string, x: number, y: number) => {
    setWorld((prevWorld) => {
      const deck = prevWorld.decksById[deckId];
      if (!deck) return prevWorld;

      return {
        ...prevWorld,
        decksById: {
          ...prevWorld.decksById,
          [deckId]: {
            ...deck,
            position: { x, y, z: deck.position.z },
          },
        },
      }
    });
  };

  // Function to update playzone position
  const updatePlayzonePosition = (playzoneId: string, x: number, y: number) => {
    setWorld((prevWorld) => {
      const playzone = prevWorld.playzonesById[playzoneId];
      if (!playzone) return prevWorld;

      return {
        ...prevWorld,
        playzonesById: {
          ...prevWorld.playzonesById,
          [playzoneId]: {
            ...playzone,
            position: { x, y, z: playzone.position.z },
          },
        },
      }
    });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, id: string, type: 'resource' | 'deck' | 'playzone') => {
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
    } else if (dragType === 'playzone') {
      updatePlayzonePosition(isDragging, newX, newY);
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
                const resource = world.resourcesById[resourceId];

                const className: string[] = ["absolute bg-gray-300 rounded-md"];
                const style: React.CSSProperties = {};

                style.left = `${resource.position.x}px`;
                style.top = `${resource.position.y}px`;

                return (
                  <GameResource
                    key={resource.id}
                    resource={resource}
                    onMouseDown={(e) => handleMouseDown(e, resourceId, 'resource')}
                    decrementResource={decrementResource}
                    incrementResource={incrementResource}
                    style={style}
                    className={className.join(" ")}
                  />
                );
              })}
              {player.decks.map((deckId) => {
                const deck = world.decksById[deckId];

                const className: string[] = ["absolute bg-gray-100 rounded-md shadow-md"];
                const style: React.CSSProperties = {};

                style.left = `${deck.position.x}px`;
                style.top = `${deck.position.y}px`;

                return (
                  <div
                    key={deckId}
                    className={className.join(" ")}
                    style={style}
                    ref={dragRef}
                  >
                    <div className="absolute top-0 left-0">
                      <DragHandle
                        onMouseDown={(e) => handleMouseDown(e, deckId, 'deck')}
                      />
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
      {
        Object.entries(world.playzonesById).map(([id, playzone]) => {
          return (
            <GamePlayzone
              key={id}
              world={world}
              playzone={playzone}
              onMouseDown={(e) => handleMouseDown(e, id, 'playzone')}
              style={{
                left: `${playzone.position.x}px`,
                top: `${playzone.position.y}px`,
                zIndex: playzone.position.z,
              }}
            />
          );
        })
      }
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
