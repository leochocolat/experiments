// Vendor
import * as THREE from 'three';
import gsap from 'gsap';
import { Pane } from 'tweakpane';

// Utils
import WindowResizeObserver from '../utils/WindowResizeObserver';

// Scenes
import Scene from './scenes/SceneLevels';

class WebGLApplication {
    constructor(options) {
        this.canvas = options.canvas;

        this._bindAll();
        this._setup();
    }

    /**
     * Private
     */
    _setup() {
        this._width = WindowResizeObserver.width;
        this._height = WindowResizeObserver.height;

        this._setupDeltaTime();
        this._setupWebGL();
        this._setupDebug();
        this._setupScene();
        this._setupEventListeners();
    }

    _setupDeltaTime() {
        this._time = 0;
        this._startTime = Date.now();
        this._dateNow = this._startTime;
        this._lastTime = this._dateNow;
        this._deltaTime = 16;
        this._fps = Math.round(1000 / this._deltaTime);
    }

    _setupWebGL() {
        this._renderer = new THREE.WebGLRenderer({
            antialias: false,
            canvas: this.canvas,
        });

        this._renderer.setSize(this._width, this._height, false);
    }

    _setupScene() {
        this._scene = new Scene({
            renderer: this._renderer,
            stream: this._streamVideo,
            width: this._width,
            height: this._height,
            debugger: this._debugger
        });
    }

    _setupDebug() {
        this._debugger = new Pane({ title: 'Debugger', expanded: true });
    }

    /**
     * On Tick
     */
    _update() {
        if (this._scene.update) {
            this._scene.update(this._time, this._deltaTime, this._fps);
        }

        this._renderer.render(this._scene, this._scene.camera);
    }

    _updateDeltaTime() {
        this._dateNow = Date.now();
        this._time = (this._dateNow - this._startTime) / 1000;
        this._deltaTime = this._dateNow - this._lastTime;
        this._lastTime = this._dateNow;
        this._fps = Math.round(1000 / this._deltaTime);
    }

    _resize(width, height) {
        this._width = width;
        this._height = height;

        this._renderer.setSize(this._width, this._height, false);
        this._scene.resize(this._width, this._height);
    }

    /**
     * Events
     */
    _bindAll() {
        this._resizeHandler = this._resizeHandler.bind(this);
        this._tickHandler = this._tickHandler.bind(this);
    }

    _setupEventListeners() {
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
        gsap.ticker.add(this._tickHandler);
    }

    /**
     * Handlers
     */
    _resizeHandler(e) {
        const { width, height } = e;
        this._resize(width, height);
    }

    _tickHandler() {
        this._update();
        this._updateDeltaTime();
    }
}

export default WebGLApplication;