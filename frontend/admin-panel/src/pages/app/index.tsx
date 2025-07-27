import { World } from "@/lib/game";
import { useEffect, useState } from "react";

export const Game = () => {
  const [world, setWorld] = useState<World>({
    t: "world",
    id: "1",
    currentPlayerId: "1",
    playersById: {},
    cardsById: {},
    decksById: {},
    charactersById: {},
    resourcesById: {},
  });

  // Function to increment resource value
  const incrementResource = (resourceId: string) => {
    setWorld(prevWorld => ({
      ...prevWorld,
      resourcesById: {
        ...prevWorld.resourcesById,
        [resourceId]: {
          ...prevWorld.resourcesById[resourceId],
          value: prevWorld.resourcesById[resourceId].value + 1
        }
      }
    }));
  };

  // Function to decrement resource value
  const decrementResource = (resourceId: string) => {
    setWorld(prevWorld => ({
      ...prevWorld,
      resourcesById: {
        ...prevWorld.resourcesById,
        [resourceId]: {
          ...prevWorld.resourcesById[resourceId],
          value: Math.max(0, prevWorld.resourcesById[resourceId].value - 1)
        }
      }
    }));
  };

  useEffect(() => {
    setWorld({
      t: "world",
      id: "1",
      currentPlayerId: "1",
      charactersById: {
        "1": {
          t: "character",
          id: "1",
          name: "Jekyll & Hyde",
          description: "Jekyll & Hyde is a hero that can transform into a monster.",
          imageUri: "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/minis/NpoqqaDotShInZPyA0iGz.png"
        }
      },
      cardsById: {
        "1": {
          t: "card",
          id: "1",
          frontImageUri: "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/decks/eEYajsgspLNDHftUQoyh2.webp",
          backImageUri: "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/card-covers/ALEF6sBXvEA3kUuJEb3gb.png",
        }
      },
      decksById: {
        "1": {
          t: "deck",
          id: "1",
          cards: ["1"],
        }
      },
      resourcesById: {
        "1": {
          t: "resource",
          id: "1",
          name: "Health",
          description: "Health is a resource that can be used to heal characters.",
          imageUri: "https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/heroes/avatars/3G9V5x3JHXMZ4G5H3Kk7s.webp",
          value: 10,
        }
      },
      playersById: {
        "1": {
          t: "player",
          id: "1",
          name: "Player 1",
          decks: ["1"],
          characters: ["1"],
          cards: ["1"],
          resources: ["1"],
        }
      },
    });
  }, [setWorld]);

  return (
    <div className="flex gap-4 p-6 w-full">

      <div className="flex flex-col gap-4">
        {
          Object.entries(world.playersById).map(([id, player]) => {
            return (
              <div key={id} className="flex gap-4 w-md">
                <h2 className="text-xl font-bold">{player.name}</h2>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">Characters</h3>
                  <div className="flex flex-col gap-2">
                    {
                      player.characters.map((characterId) => {
                        return (
                          <div key={characterId} className="flex flex-col text-center border-2 border-gray-300 rounded-md p-2 w-35">
                            <img className="" src={world.charactersById[characterId].imageUri} alt={world.charactersById[characterId].name} />
                            <h3 className="text-md font-bold">{world.charactersById[characterId].name}</h3>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">Cards</h3>
                  <div className="flex flex-col gap-2">
                    {
                      player.cards.map((cardId) => {
                        return (
                          <div key={cardId} className="flex flex-col text-center p-2 w-35">
                            <img className="" src={world.cardsById[cardId].frontImageUri} />
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">Resources</h3>
                  <div className="flex flex-col gap-2">
                    {
                      player.resources.map((resourceId) => {
                        return (
                          <div key={resourceId} className="flex flex-col text-center p-2 w-35">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <button 
                                onClick={() => decrementResource(resourceId)}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                              >
                                -
                              </button>
                              <p className="text-md font-bold min-w-[2rem]">{world.resourcesById[resourceId].value}</p>
                              <button 
                                onClick={() => incrementResource(resourceId)}
                                className="bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                            <img className="" src={world.resourcesById[resourceId].imageUri} />
                            <h3 className="text-md font-bold">{world.resourcesById[resourceId].name}</h3>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export const AppLayout = () => {
  // # Last step: show success message
  return (
    <>
      <Game />
    </>
  );
};
