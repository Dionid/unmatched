import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardId, Deck, Map, Resource } from "@/pages/app/game";
import { DragIcon } from "./additional";

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
          className={`cursor-pointer w-30 h-42 ${className}`}
          style={style}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsMenuOpen(true);
          }}
        >
          <img
            className="shadow-sm bg-gray-700 w-full h-full"
            src={isFaceUp ? frontImageUri : backImageUri}
            alt={alt ?? name}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {onFlip && (
          <DropdownMenuItem onClick={handleFlip}>Flip</DropdownMenuItem>
        )}
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

export const GamePile = ({
  cardsById,
  deck,
  allDecks,
  onTakeTopCard,
  onShuffle,
}: {
  cardsById: Record<CardId, Card>;
  deck: Deck;
  allDecks: Deck[];
  onTakeTopCard: (targetDeckId: string) => void;
  onShuffle: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTakeTopCard = (targetDeckId: string) => {
    onTakeTopCard(targetDeckId);
    setIsMenuOpen(false);
  };

  const handleShuffle = () => {
    onShuffle();
    setIsMenuOpen(false);
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="w-30 h-42 transition-transform hover:scale-103 cursor-pointer"
          onContextMenu={(e) => {
            e.preventDefault();
            setIsMenuOpen(true);
          }}
        >
          <img src={cardsById[deck.cards[0]].backImageUri} alt="Draw" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleShuffle}>Shuffle</DropdownMenuItem>
        {allDecks
          .filter((targetDeck) => targetDeck.id !== deck.id)
          .map((targetDeck) => (
            <DropdownMenuItem
              key={targetDeck.id}
              onClick={() => handleTakeTopCard(targetDeck.id)}
            >
              Take top card to {targetDeck.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const GameDeckInternal = ({
  deck,
  cardsById,
  moveCardToDeck,
  allDecks,
  onTakeTopCard,
  onShuffle,
}: {
  deck: Deck;
  cardsById: Record<CardId, Card>;
  flipCard: (cardId: string) => void;
  moveCardToDeck: (
    cardId: string,
    deckId: string,
    targetDeckId: string
  ) => void;
  allDecks: Deck[];
  onTakeTopCard: (sourceDeckId: string, targetDeckId: string) => void;
  onShuffle: (deckId: string) => void;
}) => {
  if (deck.cards.length == 0) {
    return (
      <div className="w-30 h-42">
        <div className="w-full h-full bg-gray-400 rounded-md flex items-center justify-center">
          <p className="text-sm text-gray-600">Empty</p>
        </div>
      </div>
    );
  }

  if (deck.type === "draw" || deck.type === "discard") {
    return (
      <GamePile
        cardsById={cardsById}
        deck={deck}
        allDecks={allDecks}
        onTakeTopCard={(targetDeckId) => onTakeTopCard(deck.id, targetDeckId)}
        onShuffle={() => onShuffle(deck.id)}
      />
    );
  }

  if (deck.type !== "hand") {
    throw new Error(`Invalid deck type: ${deck.type}`);
  }

  // # Hand
  return deck.cards.map((cardId) => {
    const cardStyle: React.CSSProperties = {};

    const className: string[] = [
      "w-30 hover:-translate-y-20 transition-transform hover:scale-200",
    ];

    return (
      <GameCard
        key={cardId}
        className={className.join(" ")}
        style={cardStyle}
        frontImageUri={cardsById[cardId].frontImageUri}
        backImageUri={cardsById[cardId].backImageUri}
        name={cardsById[cardId].name}
        isFaceUp={true}
        onMoveToDeck={(targetDeckId) =>
          moveCardToDeck(cardId, deck.id, targetDeckId)
        }
        availableDecks={allDecks}
        currentDeckId={deck.id}
      />
    );
  });
};

export const GameDeck = ({
  deck,
  allDecks,
  cardsById,
  flipCard,
  moveCardToDeck,
  onTakeTopCard,
  onShuffle,
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
  onTakeTopCard: (sourceDeckId: string, targetDeckId: string) => void;
  onShuffle: (deckId: string) => void;
}) => {
  const deckClassName: string[] = [];

  return (
    <div className={"flex bg-gray-300 rounded-md"}>
      {/* Rotated deck name on the left */}
      <div className="flex items-center justify-center w-8 bg-gray-100 rounded-l-md">
        <h3 className="text-md font-semibold transform -rotate-90 whitespace-nowrap">
          {deck.name}{" "}
          <span className="text-sm text-gray-600">({deck.cards.length})</span>
        </h3>
      </div>

      {/* Cards container */}
      <div className={`flex p-2 gap-1 ${deckClassName.join(" ")}`}>
        <GameDeckInternal
          deck={deck}
          cardsById={cardsById}
          flipCard={flipCard}
          moveCardToDeck={moveCardToDeck}
          allDecks={allDecks}
          onTakeTopCard={onTakeTopCard}
          onShuffle={onShuffle}
        />
      </div>
    </div>
  );
};

export const GameResource = ({
  resource,
  style,
  onMouseDown,
  className,
  decrementResource,
  incrementResource,
}: {
  resource: Resource;
  style: React.CSSProperties;
  onMouseDown: (e: React.MouseEvent, id: string, type: 'resource' | 'deck' | 'playzone') => void;
  decrementResource: (resourceId: string) => void;
  incrementResource: (resourceId: string) => void;
  className?: string;
}) => {
  return (
    <div
      className={className}
      style={style}
    >
      <div 
        className="absolute top-0 left-0 w-6 h-6 rounded-tl-md cursor-move flex items-center justify-center hover:bg-gray-400 transition-colors"
        onMouseDown={(e) => onMouseDown(e, resource.id, 'resource')}
      >
        <DragIcon/>
      </div>
      
      <div
        key={resource.id}
        className="flex flex-col w-30"
      >
        <div className="flex items-center justify-center bg-gray-100 rounded-t-md">
          <h3 className="text-md font-semibold">
            {resource.name}
          </h3>
        </div>

        <div className="p-4 pt-2">
          <img
            className="rounded-[50%] mt-2"
            src={resource.imageUri}
          />
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => decrementResource(resource.id)}
              className="bg-white rounded-md w-6 h-6 flex items-center justify-center text-lg font-bold cursor-pointer"
            >
              -
            </button>
            <p className="text-md font-bold min-w-[1.5rem]">
              {resource.value}
            </p>
            <button
              onClick={() => incrementResource(resource.id)}
              className="bg-white rounded-md w-6 h-6 flex items-center justify-center text-lg font-bold cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const GameMap = ({
  map,
  className,
  style,
}: {
  map: Map;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={`w-full h-full ${className}`}
      style={style}
    >
      <img
        className="w-full h-full shadow-sm bg-gray-700 rounded-md"
        src={map.imageUri}
        alt={map.name}
      />
    </div>
  );
};