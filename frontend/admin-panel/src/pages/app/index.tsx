import { World } from "@/pages/app/game";
import { useEffect, useState, useRef } from "react";
import {useSyncExternalStoreWithSelector} from "use-sync-external-store/with-selector"
import { GameCharacter, GameDeck, GameMap, GameResource } from "./game-card";
import { firstWorld } from "./first-world";
import { DragHandle } from "./additional";
import * as Y from "yjs";
import { bind } from '@/lib/immer-yjs'

const doc = new Y.Doc()

// define store
const binder = bind<{ world: World }>(doc.getMap('world-wrapper'))

function useImmerYjs<Selection>(selector: (state: { world: World }) => Selection) {
  const selection = useSyncExternalStoreWithSelector(binder.subscribe, binder.get, binder.get, selector)

  return [selection, binder.update] as const;
}

// optionally set initial data
binder.update((wrapper) => {
    wrapper.world = firstWorld;
})


export const Game = () => {
  const [world, update] = useImmerYjs(({world}) => world);

  // Drag state management
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragType, setDragType] = useState<"resource" | "deck" | "map" | "character" | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    update(({world}) => {
      world.resourcesById["1"].position.x = 20;
      world.resourcesById["1"].position.y = 20;
      world.resourcesById["1"].position.z = 0;

      world.decksById["1"].position.x = window.innerWidth / 2 - 100;
      world.decksById["1"].position.y = window.innerHeight - 200;
      world.decksById["1"].position.z = 0;

      world.decksById["2"].position.x = window.innerWidth - 190;
      world.decksById["2"].position.y = window.innerHeight - 200;
      world.decksById["2"].position.z = 0;

      world.decksById["3"].position.x = 20;
      world.decksById["3"].position.y = window.innerHeight - 200;
      world.decksById["3"].position.z = 0;

      world.decksById["e4a3facf-ad44-4dc3-ae4e-003a590f9f93"].position.x = window.innerWidth / 2 - 300;
      world.decksById["e4a3facf-ad44-4dc3-ae4e-003a590f9f93"].position.y = window.innerHeight / 2 - 100;
      world.decksById["e4a3facf-ad44-4dc3-ae4e-003a590f9f93"].position.z = 0;

      world.mapsById["1"].position.x = window.innerWidth / 2 - 100;
      world.mapsById["1"].position.y = 50;
      world.mapsById["1"].position.z = 0;

      world.charactersById["1"].position.x = 100;
      world.charactersById["1"].position.y = 100;
      world.charactersById["1"].position.z = 0;
    });
  }, []);

  // Function to increment resource value
  const incrementResource = (resourceId: string) => {
    update(({world}) => {
      world.resourcesById[resourceId].value += 1;
    });
  };

  // Function to decrement resource value
  const decrementResource = (resourceId: string) => {
    update(({world}) => {
      world.resourcesById[resourceId].value -= 1;
    });
  };

  // // // Function to update resource position
  const updateResourcePosition = (resourceId: string, x: number, y: number) => {
    update(({world}) => {
      world.resourcesById[resourceId].position.x = x;
      world.resourcesById[resourceId].position.y = y;
    });
  };

  // Function to update map position
  const updateMapPosition = (mapId: string, x: number, y: number) => {
    update(({world}) => {
      world.mapsById[mapId].position.x = x;
      world.mapsById[mapId].position.y = y;
    });
  };

  const updateCharacterPosition = (characterId: string, x: number, y: number) => {
    update(({world}) => {
      world.charactersById[characterId].position.x = x;
      world.charactersById[characterId].position.y = y;
    });
  };

  // // // Function to update deck position
  const updateDeckPosition = (deckId: string, x: number, y: number) => {
    update(({world}) => {
      world.decksById[deckId].position.x = x;
      world.decksById[deckId].position.y = y;
    });
  };

  // // Drag handlers
  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: "resource" | "deck" | "map" | "character"
  ) => {
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

    if (dragType === "resource") {
      updateResourcePosition(isDragging, newX, newY);
    } else if (dragType === "deck") {
      updateDeckPosition(isDragging, newX, newY);
    } else if (dragType === "map") {
      updateMapPosition(isDragging, newX, newY);
    } else if (dragType === "character") {
      updateCharacterPosition(isDragging, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
    setDragType(null);
  };

  // // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, dragType]);

  const flipCard = (cardId: string) => {
    update(({world}) => {
      world.cardsById[cardId].isFaceUp = !world.cardsById[cardId].isFaceUp;
    });
  };

  const moveCardToDeck = (
    cardId: string,
    currentDeckId: string,
    targetDeckId: string
  ) => {
    update(({world}) => {
      const currentDeck = world.decksById[currentDeckId];
      const targetDeck = world.decksById[targetDeckId];

      if (targetDeck.type === "play") {
        world.cardsById[cardId].isFaceUp = false;
      }
      
      currentDeck.cards = currentDeck.cards.filter((id) => id !== cardId);
      targetDeck.cards.push(cardId);
    });
  };

  // // Function to take top card from a deck and move it to another deck
  const takeTopCard = (sourceDeckId: string, targetDeckId: string) => {
    update(({world}) => {
      const sourceDeck = world.decksById[sourceDeckId];
      const movingCard = world.cardsById[sourceDeck.cards[sourceDeck.cards.length - 1]];

      const targetDeck = world.decksById[targetDeckId];

      if (targetDeck.type === "play") {
        movingCard.isFaceUp = false;
      }

      sourceDeck.cards = sourceDeck.cards.slice(0, -1);
      targetDeck.cards.push(movingCard.id);
    });
  };

  // // Function to shuffle a deck
  const shuffleDeck = (deckId: string) => {
    update(({world}) => {
      const deck = world.decksById[deckId];
      if (!deck || deck.cards.length === 0) return;

      const shuffledCards = [...deck.cards];
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
      }

      deck.cards = shuffledCards;
    });
  };

  return (
    <div className="w-full h-full p-6 relative">
      <div className="flex flex-col gap-4">
        {Object.entries(world.mapsById).map(([id, map]) => {
          const style: React.CSSProperties = {};

          style.left = `${map.position.x}px`;
          style.top = `${map.position.y}px`;

          style.width = map.size.width;
          style.height = map.size.height;

          return (
            <div
              key={id}
              className={"absolute bg-gray-300 rounded-md shadow-md"}
              style={style}
              ref={dragRef}
            >
              <div className="absolute top-0 left-0">
                <DragHandle
                  onMouseDown={(e) => handleMouseDown(e, id, "map")}
                />
              </div>
              <div className="w-full h-full p-1 pl-6 shadow-sm">
                <GameMap key={id} map={map} />
              </div>
            </div>
          );
        })}
        {Object.entries(world.charactersById).map(([id, character]) => {
          const style: React.CSSProperties = {};

          style.left = `${character.position.x}px`;
          style.top = `${character.position.y}px`;

          style.width = character.size.width;
          style.height = character.size.height;

          style.backgroundColor = "rgba(0, 0, 0, 0.2)";

          return <div
            key={id}
            className="absolute rounded-md cursor-grab"
            style={style}
            onMouseDown={(e) => handleMouseDown(e, id, "character")}
          >
            <GameCharacter character={character} />
          </div>
        })}
        {Object.entries(world.playersById).map(([id, player]) => {
          if (id !== world.currentPlayerId) return null;

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
                    onMouseDown={(e) =>
                      handleMouseDown(e, resourceId, "resource")
                    }
                    decrementResource={decrementResource}
                    incrementResource={incrementResource}
                    style={style}
                    className={className.join(" ")}
                  />
                );
              })}
              {player.decks.map((deckId) => {
                const deck = world.decksById[deckId];

                const className: string[] = [
                  "absolute bg-gray-300 rounded-md shadow-md",
                ];
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
                        onMouseDown={(e) => handleMouseDown(e, deckId, "deck")}
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
