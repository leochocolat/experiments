// Config
import sceneFactory from './scenes/sceneFactory';

// Vendor
import * as THREE from 'three';
import gsap from 'gsap';
import { Pane } from 'tweakpane';

// Utils
import WindowResizeObserver from '../utils/WindowResizeObserver';
import { Clock } from 'three';

class WebGLApplication {
    constructor(options) {
        this.canvas = options.canvas;
        this.sceneName = options.sceneName;

        this._settings = {
            isPaused: false,
            dpr: 2,
        }

        this._bindAll();
        this._setup();
    }

    /**
     * Private
     */
    _setup() {
        this._viewportWidth = WindowResizeObserver.width;
        this._viewportHeight = WindowResizeObserver.height;

        this._width = this._viewportWidth;
        this._height = this._viewportHeight;

        this._setupClock();
        this._setupWebGL();
        this._setupDebug();
        this._setupScene();
        this._setupEventListeners();
    }

    _setupClock() {
        this._clock = new Clock();
        this._time = 0;
    }

    _setupWebGL() {
        this._renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvas,
            preserveDrawingBuffer: true
        });

        this._renderer.setSize(this._width, this._height, false);
    }

    _setupScene() {
        const constructor = sceneFactory[this.sceneName];
        this._scene = new constructor({
            root: this,
            renderer: this._renderer,
            stream: this._streamVideo,
            width: this._width,
            height: this._height,
            debugger: this._debugger
        });
    }

    _setupDebug() {
        this._debugger = new Pane({ title: 'Debugger', expanded: true });
        this._debugger.addInput(this._settings, 'isPaused', { label: 'Paused' });
        this._debugger.addInput(this._settings, 'dpr', { label: 'DPR', min: 0, max: 4 }).on('change', () => {
            this._resize(this._viewportWidth, this._viewportHeight);
        });
    }

    /**
     * On Tick
     */
    _update() {
        if (this._settings.isPaused) return;

        this._deltaTime = this._clock.getDelta();
        this._time += this._deltaTime;
        this._fps = Math.round(1000 / this._deltaTime);

        if (this._scene.update) {
            this._scene.update(this._time, this._deltaTime, this._fps);
        }

        if (this._scene.render) {
            this._scene.render();
        } else {
            this._renderer.render(this._scene, this._scene.camera);
        }
    }

    _resize(width, height) {
        this._viewportWidth = width;
        this._viewportHeight = height;

        this._width = this._viewportWidth;
        this._height = this._viewportHeight;

        this._renderer.setPixelRatio(this._settings.dpr);
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
    }
}

export default WebGLApplication;