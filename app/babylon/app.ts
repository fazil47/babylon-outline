import {
    AbstractMesh,
    ArcRotateCamera,
    Color3,
    DepthRenderer,
    Engine,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PostProcess,
    Scene,
    SceneLoader,
    StandardMaterial,
    Vector2,
    Vector3,
} from "@babylonjs/core";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

export const minBlurRadius = 0.1;
export const maxBlurRadius = 1.0;
export const minOutlineThickness = 0.1;
export const maxOutlineThickness = 0.9;

export default class BabylonApp {
    engine: Engine;

    private _scene: Scene;
    private _camera: ArcRotateCamera;
    private _pickedMesh: AbstractMesh | null = null;
    private _depthRenderer: DepthRenderer;
    private _blurRadius: number = 0.1;
    private _outlineThickness: number = 0.9;
    private _outlineColor: Color3 = Color3.Purple();
    private _outlinePostProcess: PostProcess | null = null;

    public get blurRadius(): number {
        return this._blurRadius;
    }
    public set blurRadius(value: number) {
        if (value < minBlurRadius) {
            this._blurRadius = minBlurRadius;
        } else if (value > maxBlurRadius) {
            this._blurRadius = maxBlurRadius;
        } else {
            this._blurRadius = value;
        }

        this._outlinePostProcess?.getEffect().setFloat(
            "blurRadius",
            this._blurRadius,
        );
    }

    public get outlineThickness(): number {
        return this._outlineThickness;
    }
    public set outlineThickness(value: number) {
        if (value < minOutlineThickness) {
            this._outlineThickness = minOutlineThickness;
        } else if (value > maxOutlineThickness) {
            this._outlineThickness = maxOutlineThickness;
        } else {
            this._outlineThickness = value;
        }

        this._outlinePostProcess?.getEffect().setFloat(
            "outlineThreshold",
            1.0 - this._outlineThickness,
        );
    }

    public get outlineColor(): string {
        return this._outlineColor.toHexString();
    }
    public set outlineColor(value: string) {
        this._outlineColor = Color3.FromHexString(value);
        this._outlinePostProcess?.getEffect().setColor3(
            "outlineColor",
            this._outlineColor,
        );
    }

    private pickMeshOnHover = (): void => {
        const pickingInfo = this._scene.pick(
            this._scene.pointerX,
            this._scene.pointerY,
        );

        if (this._pickedMesh !== pickingInfo.pickedMesh) {
            // If the picked mesh has changed, recreate the renderList with only the new mesh
            const depthRtt = this._depthRenderer.getDepthMap();
            depthRtt.renderList = [];

            if (pickingInfo.pickedMesh) {
                depthRtt.renderList?.push(pickingInfo.pickedMesh);
            }
        }

        this._pickedMesh = pickingInfo.pickedMesh;
    };

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new Engine(canvas);
        this._scene = new Scene(this.engine);

        // Camera
        this._camera = new ArcRotateCamera(
            "camera",
            -0.961067694771414,
            1.2413272669014423,
            8,
            Vector3.Zero(),
            this._scene,
        );
        this._camera.attachControl();

        // Lights
        new HemisphericLight(
            "hemi-light",
            this._camera.position,
            this._scene,
        );

        // Environment and meshes
        this._setupMeshes();
        this._setupInspector();

        // Mesh picking and outline renderer
        this._scene.onPointerMove = this.pickMeshOnHover;
        this._depthRenderer = this._getDepthRenderer();
        this._setupPickedMeshOutline();

        this.engine.runRenderLoop(() => {
            if (!this._scene) {
                throw new Error("No scene");
            }

            this._scene.render();
        });
    }

    private async _setupMeshes(): Promise<void> {
        // Create a few primitive meshes
        const boxMesh1: Mesh = MeshBuilder.CreateBox("box1");
        boxMesh1.position = new Vector3(
            -0.7218455076217651,
            0,
            -1.388353943824768,
        );
        const boxMesh2: Mesh = MeshBuilder.CreateBox("box2");
        boxMesh2.position = new Vector3(
            0.0072354963049292564,
            0.1556306928396225,
            0.14504589140415192,
        );

        const sphereMesh1: Mesh = MeshBuilder.CreateSphere("sphere1");
        sphereMesh1.position = new Vector3(
            -1.1153115034103394,
            1.8324054479599,
            0.5825020670890808,
        );
        const sphereMesh2: Mesh = MeshBuilder.CreateSphere("sphere2");
        sphereMesh2.position = new Vector3(
            -0.5230284929275513,
            2.0824482440948486,
            0,
        );
        const sphereMesh3: Mesh = MeshBuilder.CreateSphere("sphere3");
        sphereMesh3.position = new Vector3(
            0.10989203304052353,
            1.5335813760757446,
            0.29299378395080566,
        );

        const cylinderMesh1: Mesh = MeshBuilder.CreateCylinder("cylinder1");
        cylinderMesh1.position = new Vector3(
            -1.444791555404663,
            -0.0652659609913826,
            -0.8816058039665222,
        );
        cylinderMesh1.rotation = new Vector3(
            1.0633099270817064,
            -0.7379865187193025,
            3.669871751298748e-7,
        );
        const cylinderMesh2: Mesh = MeshBuilder.CreateCylinder("cylinder2");
        cylinderMesh2.position = new Vector3(
            -2.03320574760437,
            0.8509584069252014,
            0.45334315299987793,
        );
        cylinderMesh2.rotation = new Vector3(
            0.4722660366248883,
            -0.3554557186164294,
            -0.6844484826570724,
        );

        const groundMesh = MeshBuilder.CreateGround("ground");
        groundMesh.scaling = new Vector3(8.0, 1.0, 8.0);

        const redMaterial = new StandardMaterial("red");
        redMaterial.diffuseColor = Color3.Red();
        const greenMaterial = new StandardMaterial("green");
        greenMaterial.diffuseColor = Color3.Green();
        const blueMaterial = new StandardMaterial("blue");
        blueMaterial.diffuseColor = Color3.Blue();
        const whiteMaterial = new StandardMaterial("white");
        whiteMaterial.diffuseColor = Color3.White();

        const redMeshes = [
            boxMesh1,
            cylinderMesh2,
            sphereMesh2,
        ];
        const greenMeshes = [
            boxMesh2,
            sphereMesh1,
        ];
        const blueMeshes = [
            cylinderMesh1,
            sphereMesh3,
        ];
        const whiteMeshes = [
            groundMesh,
        ];

        for (const mesh of redMeshes) {
            mesh.material = redMaterial;
        }
        for (const mesh of greenMeshes) {
            mesh.material = greenMaterial;
        }
        for (const mesh of blueMeshes) {
            mesh.material = blueMaterial;
        }
        for (const mesh of whiteMeshes) {
            mesh.material = whiteMaterial;
        }

        // Load the OBJ Mesh
        registerBuiltInLoaders();
        await SceneLoader.ImportMeshAsync(
            null,
            "./models/lion/",
            "lion.obj",
            this._scene,
            (progressEvent) => {
                console.log(
                    `Loading lion: ${
                        progressEvent.loaded / progressEvent.total * 100
                    }%`,
                );
            },
        );
    }

    private _getDepthRenderer(): DepthRenderer {
        // This depthRenderer is used for getting the depth map of a scene with only the picked mesh in it
        const depthRenderer = this._scene.enableDepthRenderer();
        const depthMap = depthRenderer.getDepthMap();
        depthMap.renderList = []; // Only add picked meshes to the render list
        depthMap.resize(1024); // Initializes to screen size, always set size to 1024

        return depthRenderer;
    }

    /**
     * Sets up the post process effect for drawing the outline of the picked mesh.
     * The outline is drawn by applying a Sobel filter over the depth map of a scene with only the picked mesh.
     */
    private _setupPickedMeshOutline(): void {
        const outlinePostProcess = new PostProcess(
            "outline post process",
            "./shaders/outline-postprocess",
            null,
            [
                "pickedMeshDepthSampler",
                "screenSize",
                "blurRadius",
                "outlineColor",
                "outlineThreshold",
            ],
            1.0,
            this._camera,
        );
        outlinePostProcess.onApply = (effect) => {
            effect.setTexture(
                "pickedMeshDepthSampler",
                this._depthRenderer.getDepthMap(),
            );
            effect.setVector2(
                "screenSize",
                new Vector2(
                    this.engine.getRenderWidth(),
                    this.engine.getRenderHeight(),
                ),
            );
            effect.setFloat("blurRadius", this._blurRadius);
            effect.setFloat("outlineThreshold", 1.0 - this._outlineThickness);
            effect.setColor3("outlineColor", this._outlineColor);
        };
        outlinePostProcess.samples = 4;
        this._outlinePostProcess = outlinePostProcess;
    }

    /**
     * Make inspector available during development.
     */
    private async _setupInspector(): Promise<void> {
        if (process.env.NODE_ENV === "development") {
            const { Inspector } = await import("@babylonjs/inspector");
            let isVisible = false;

            window.addEventListener("keydown", (ev) => {
                // Toggle inspector visibility when Ctrl + Shift + O is pressed
                if (
                    ev.ctrlKey && ev.shiftKey && ev.code === "KeyO"
                ) {
                    if (isVisible) {
                        Inspector.Hide();
                        isVisible = false;
                    } else {
                        Inspector.Show(this._scene, {});
                        isVisible = true;
                    }
                }
            });
        }
    }
}
