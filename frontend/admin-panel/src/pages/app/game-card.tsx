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
          className={`p-2 cursor-pointer hover:bg-gray-100 rounded transition-colors ${className}`}
          style={style}
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
  const deckClassName: string[] = []
  
  if (deck.grouped) {
    deckClassName.push("relative")
  }

  if (deck.cards.length == 0) {
    deckClassName.push("w-24 h-30")
  }

  return (
    <div className={"flex flex-col bg-gray-200 rounded-md"}>
      <h3 className="text-md font-semibold px-4 pt-2">
        {deck.name}
      </h3>
      <div className={`flex ${deckClassName.join(" ")}`}>
      {deck.cards.map((cardId, index) => {
        const cardStyle: React.CSSProperties = {};

        const className: string[] = [
          "w-30 hover:-translate-y-16 transition-transform hover:scale-150"
        ]

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
