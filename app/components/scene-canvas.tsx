import { useEffect, useRef, useState } from "react";
import BabylonApp from "~/babylon/app";
import SceneControls from "./scene-controls";

export default function SceneCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [babylonApp, setBabylonApp] = useState<BabylonApp | null>(null);
    const [blurRadius, setBlurRadius] = useState<number>(0.01);
    const [outlineThickness, setOutlineThickness] = useState<number>(0.9);
    const [outlineColor, setOutlineColor] = useState<string>("#800080");

    // Initialize the Babylon app
    useEffect(() => {
        if (canvasRef.current) {
            const app = new BabylonApp(canvasRef.current);
            setBabylonApp(app);
            setBlurRadius(app.blurRadius);
            setOutlineThickness(app.outlineThickness);
            setOutlineColor(app.outlineColor);
        }
    }, [canvasRef]);

    // Resize the canvas when window is resized
    useEffect(() => {
        if (window) {
            resizeCanvas();
            window.addEventListener("resize", resizeCanvas);

            return () => {
                window.removeEventListener("resize", resizeCanvas);
            };
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [babylonApp?.engine]);

    const resizeCanvas = () => {
        if (babylonApp?.engine) {
            babylonApp.engine.resize(true);
        }
    };

    return (
        <>
            <canvas className="h-full w-full" ref={canvasRef}></canvas>
            <SceneControls
                blurRadius={blurRadius}
                setBlurRadius={(value) => {
                    setBlurRadius(value);
                    babylonApp!.blurRadius = value;
                }}
                outlineThickness={outlineThickness}
                setOutlineThickness={(value) => {
                    setOutlineThickness(value);
                    babylonApp!.outlineThickness = value;
                }}
                outlineColor={outlineColor}
                setOutlineColor={(value) => {
                    setOutlineColor(value);
                    babylonApp!.outlineColor = value;
                }}
            />
        </>
    );
}
