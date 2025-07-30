

export const DragIcon = () => {
    return (
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
    )
}

export const DragHandle = ({
    onMouseDown,
    className,
}: {
    onMouseDown: (e: React.MouseEvent) => void;
    className?: string;
}) => {
    return (
        <div 
            className={`w-6 h-6 rounded-tl-md cursor-move flex items-center justify-center hover:bg-gray-400 transition-colors ${className}`}
            onMouseDown={onMouseDown}
        >
            <DragIcon/>
        </div>
    )
}