

export const GameCard = ({ frontImageUri, backImageUri, alt, name, isFaceUp, onClick }: { frontImageUri: string; backImageUri: string; alt?: string, name: string, isFaceUp: boolean, onClick?: () => void }) => {
  return (
    <div className="flex flex-col text-center p-2 w-35" onClick={onClick}>
        <img className="" src={isFaceUp ? frontImageUri : backImageUri} alt={alt ?? name} />
        <h3 className="text-md font-bold">{name}</h3>
    </div>
  )
}