import { useEffect, useRef, useState } from "react";
import BabylonApp from "~/babylon/app";

export default function SceneCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [babylonApp, setBabylonApp] = useState<BabylonApp | null>(null);

    // Initialize the Babylon app
    useEffect(() => {
        if (canvasRef.current) {
            const app = new BabylonApp(canvasRef.current);
            setBabylonApp(app);
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

    return <canvas className="h-full w-full" ref={canvasRef}></canvas>;
}
