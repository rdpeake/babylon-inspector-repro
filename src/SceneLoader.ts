import { ArcRotateCamera, Color3, Color4, DebugLayer, DefaultRenderingPipeline, Engine, HemisphericLight, Light, MeshBuilder, PointLight, Scene, Vector3 } from "@babylonjs/core";
declare var BABYLON: any;
declare var INSPECTOR: any;
import '@babylonjs/inspector'


export class SceneLoader {
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;


    constructor(canvas: HTMLCanvasElement) {

        this._engine = new Engine(canvas, false, {}, true);

        this._scene = new Scene(this._engine);

        this._scene.clearColor = new Color4(0, 0, 0, 0);

        var comCamera = {
            alpha: Math.PI / 2,
            beta: Math.PI / 2,
            radius: 5,
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            position2: {
                x: 0,
                y: 0,
                z: 2
            },
            fov: 0.5,
            exposure: 1.0,
            contrast: 1.0,
            sharpen: 0.15
        };

        this._camera = new ArcRotateCamera("Camera", comCamera.alpha, comCamera.beta, comCamera.radius, new Vector3(comCamera.position.x, comCamera.position.y, comCamera.position.z), this._scene);
        this._camera.fov = comCamera.fov
        //this._camera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
        this._camera.wheelPrecision = 500; // default 3
        this._camera.lowerRadiusLimit = comCamera.radius / 3;
        this._camera.upperRadiusLimit = comCamera.radius * 3;
        this._camera.minZ = 0.1; // default 1
        this._camera.maxZ = 20; // default 10000

        // rendering pipeline config
        let pipeline = new DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            true, // Do you want the pipeline to use HDR texture?
            this._scene, // The scene instance
            [this._camera] // The list of cameras to be attached to
        );
        if (this._engine.webGLVersion >= 2) {
            pipeline.samples = 1;
        }
        pipeline.fxaaEnabled = true;
        pipeline.imageProcessing.exposure = comCamera.exposure ? comCamera.exposure : 1.0;
        pipeline.imageProcessing.contrast = comCamera.contrast ? comCamera.contrast : 1.0;
        if (comCamera.sharpen && comCamera.sharpen > 0) {
            pipeline.sharpenEnabled = true;
            pipeline.sharpen.edgeAmount = comCamera.sharpen;
        }


        this._camera.attachControl(canvas, true);

        const light = new HemisphericLight("light", new Vector3(1, 1, 0), this._scene);


        //add something to the screen
        const sphere = MeshBuilder.CreateSphere("sphere", {});

        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        if ((typeof BABYLON != "undefined" && BABYLON.Inspector) || typeof INSPECTOR != "undefined")
            this._scene.debugLayer.show();
    }
}