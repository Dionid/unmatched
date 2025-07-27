import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { World } from "@/lib/game";

export const GameCard = ({
  frontImageUri,
  backImageUri,
  alt,
  name,
  isFaceUp,
  onClick,
  onFlip,
  onMoveToDeck,
  availableDecks = [],
  disableMenu = false,
  currentDeckId,
  className,
  style,
}: {
  frontImageUri: string;
  backImageUri: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  name: string;
  isFaceUp: boolean;
  currentDeckId?: string;
  disableMenu?: boolean;
  onClick?: () => void;
  onFlip?: () => void;
  onMoveToDeck?: (deckId: string) => void;
  availableDecks?: Array<{ id: string; name: string }>;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  const handleFlip = () => {
    if (onFlip) {
      onFlip();
    }
    setIsMenuOpen(false);
  };

  const handleMoveToDeck = (deckId: string) => {
    if (deckId === currentDeckId) {
      return;
    }

    if (onMoveToDeck) {
      onMoveToDeck(deckId);
    }
    setIsMenuOpen(false);
  };

  return (
    <DropdownMenu
      open={isMenuOpen && !disableMenu}
      onOpenChange={setIsMenuOpen}
    >
      <DropdownMenuTrigger asChild>
        <div
          className={`flex flex-col text-center p-2 w-35 cursor-pointer hover:bg-gray-100 rounded transition-colors ${className}`}
          style={style}
          onClick={handleCardClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsMenuOpen(true);
          }}
        >
          <img
            className="border-1 border-gray-300"
            src={isFaceUp ? frontImageUri : backImageUri}
            alt={alt ?? name}
          />
          {/* <h3 className="text-md font-bold">{name}</h3> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleFlip}>Flip</DropdownMenuItem>
        {availableDecks
          .filter((deck) => deck.id !== currentDeckId)
          .map((deck) => (
            <DropdownMenuItem
              key={deck.id}
              onClick={() => handleMoveToDeck(deck.id)}
            >
              Move to {deck.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Deck = ({
  deckId,
  world,
  flipCard,
  moveCardToDeck,
}: {
  deckId: string;
  world: World;
  flipCard: (cardId: string) => void;
  moveCardToDeck: (
    cardId: string,
    deckId: string,
    targetDeckId: string
  ) => void;
}) => {
  return (
    <div
      className={`${
        world.decksById[deckId].grouped
          ? "relative h-50"
          : "grid grid-cols-4 w-130 gap-2"
      }`}
    >
      {world.decksById[deckId].cards.map((cardId, index) => {
        return (
          <GameCard
            key={cardId}
            className={world.decksById[deckId].grouped ? `absolute` : ""}
            style={
              world.decksById[deckId].grouped ? { left: `${index * 3}px` } : {}
            }
            frontImageUri={world.cardsById[cardId].frontImageUri}
            backImageUri={world.cardsById[cardId].backImageUri}
            name={world.cardsById[cardId].name}
            isFaceUp={world.cardsById[cardId].isFaceUp}
            onClick={() => flipCard(cardId)}
            onFlip={() => flipCard(cardId)}
            onMoveToDeck={(targetDeckId) =>
              moveCardToDeck(cardId, deckId, targetDeckId)
            }
            availableDecks={Object.entries(world.decksById).map(
              ([id, deck]) => ({
                id,
                name: deck.name,
              })
            )}
            currentDeckId={deckId}
          />
        );
      })}
    </div>
  );
};
