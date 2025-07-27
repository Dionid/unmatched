import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardId, Deck } from "@/pages/app/game";

export const GameCard = ({
  frontImageUri,
  backImageUri,
  alt,
  name,
  isFaceUp,
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
  onFlip?: () => void;
  onMoveToDeck?: (deckId: string) => void;
  availableDecks?: Array<{ id: string; name: string }>;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          className={`cursor-pointer ${className}`}
          style={style}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsMenuOpen(true);
          }}
        >
          <img
            className="shadow-sm"
            src={isFaceUp ? frontImageUri : backImageUri}
            alt={alt ?? name}
          />
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

export const GameDeck = ({
  deck,
  allDecks,
  cardsById,
  flipCard,
  moveCardToDeck,
}: {
  deck: Deck;
  allDecks: Deck[];
  cardsById: Record<CardId, Card>;
  flipCard: (cardId: string) => void;
  moveCardToDeck: (
    cardId: string,
    deckId: string,
    targetDeckId: string
  ) => void;
}) => {
  const deckClassName: string[] = [];

  return (
    <div className={"flex bg-gray-300 rounded-md"}>
      {/* Rotated deck name on the left */}
      <div className="flex items-center justify-center w-10">
        <h3 className="text-md font-semibold transform -rotate-90 whitespace-nowrap">
          {deck.name}
        </h3>
      </div>

      {/* Cards container */}
      <div className={`flex p-2 gap-1 ${deckClassName.join(" ")}`}>

        {/* Empty card */}
        {deck.cards.length == 0 && (
          <div className="w-27 h-40">
            <div className="w-full h-full bg-gray-300 rounded-md flex items-center justify-center">
              <p className="text-sm text-gray-500">Empty</p>
            </div>
          </div>
        )}

        {deck.cards.map((cardId) => {
          const cardStyle: React.CSSProperties = {};

          const className: string[] = [
            "w-30 hover:-translate-y-10 transition-transform hover:scale-150",
          ];

          return (
            <GameCard
              key={cardId}
              className={className.join(" ")}
              style={cardStyle}
              frontImageUri={cardsById[cardId].frontImageUri}
              backImageUri={cardsById[cardId].backImageUri}
              name={cardsById[cardId].name}
              isFaceUp={cardsById[cardId].isFaceUp}
              onFlip={() => flipCard(cardId)}
              onMoveToDeck={(targetDeckId) =>
                moveCardToDeck(cardId, deck.id, targetDeckId)
              }
              availableDecks={allDecks}
              currentDeckId={deck.id}
            />
          );
        })}
      </div>
    </div>
  );
};
