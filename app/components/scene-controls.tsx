import {
    maxBlurRadius,
    maxOutlineThickness,
    minBlurRadius,
    minOutlineThickness,
} from "~/babylon/app";

export type SceneControlsProps = {
    blurRadius: number;
    setBlurRadius: (value: number) => void;
    outlineThickness: number;
    setOutlineThickness: (value: number) => void;
    outlineColor: string;
    setOutlineColor: (value: string) => void;
};

export default function SceneControls({
    blurRadius,
    setBlurRadius,
    outlineThickness,
    setOutlineThickness,
    outlineColor,
    setOutlineColor,
}: SceneControlsProps) {
    return (
        <div className="absolute top-4 right-4 bg-gray-100 dark:bg-gray-800 p-2 rounded flex gap-2 flex-col">
            <label className="p-1 flex-row gap-1 justify-between">
                <span className="block">Blur radius</span>
                <input
                    type="range"
                    min={minBlurRadius}
                    max={maxBlurRadius}
                    step={0.01}
                    value={blurRadius}
                    onChange={(e) => setBlurRadius(parseFloat(e.target.value))}
                />
            </label>
            <label className="p-1 flex-row gap-1 justify-between">
                <span className="block">Outline thickness</span>
                <input
                    type="range"
                    min={minOutlineThickness}
                    max={maxOutlineThickness}
                    step={0.01}
                    value={outlineThickness}
                    onChange={(e) =>
                        setOutlineThickness(parseFloat(e.target.value))}
                />
            </label>
            <label className="p-1 flex-row gap-1 justify-between">
                <span className="block">Outline color</span>
                <input
                    type="color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                />
            </label>
        </div>
    );
}
