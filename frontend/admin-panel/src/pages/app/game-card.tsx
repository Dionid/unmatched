import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const GameCard = ({ 
  frontImageUri, 
  backImageUri, 
  alt, 
  name, 
  isFaceUp, 
  onClick,
  onFlip,
  onMoveToDeck,
  availableDecks = []
}: { 
  frontImageUri: string; 
  backImageUri: string; 
  alt?: string; 
  name: string; 
  isFaceUp: boolean; 
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
    if (onMoveToDeck) {
      onMoveToDeck(deckId);
    }
    setIsMenuOpen(false);
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div 
          className="flex flex-col text-center p-2 w-35 cursor-pointer hover:bg-gray-100 rounded transition-colors" 
          onClick={handleCardClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsMenuOpen(true);
          }}
        >
          <img className="" src={isFaceUp ? frontImageUri : backImageUri} alt={alt ?? name} />
          <h3 className="text-md font-bold">{name}</h3>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleFlip}>
          Flip
        </DropdownMenuItem>
        {availableDecks.map((deck) => (
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