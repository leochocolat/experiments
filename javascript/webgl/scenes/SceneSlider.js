// Utils
import DragManager from '../../utils/DragManager';
import math from '../../utils/math';

// Config
import grid from '../configs/grid';

// Vendors
import gsap from 'gsap';
import { PerspectiveCamera, Scene } from 'three';
import InertiaPlugin from '../../vendors/gsap/InertiaPlugin';
import Slide from '../objects/Slide';

const PESPECTIVE = 800;

class SceneSlider extends Scene {
    constructor(options = {}) {
        super();

        this._width = options.width;
        this._height = options.height;
        this._debugger = options.debugger;
        this._renderer = options.renderer;

        this._settings = {
            damping: 0.1,
            mouseDamping: 0.1,
            mouseScale: 0.4,
            scale: 0.7,
            padding: 200,
            zPadding: 50,
            parallax: {
                scale: 1.2
            },
            filters: {
                levelFactor: 1.5,
                saturationFactor: 1,
                brightnessFactor: 0.2,
                contrastFactor: 1,
                alphaFactor: 1,
            }
        }

        this._mousePosition = {
            target: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
        }

        this._normalizedMousePosition = {
            target: { x: 0, y: 0 },
            current: { x: 0, y: 0 },
        }

        this._position = {
            target: { x: 0 },
            current: { x: 0 },
        }

        this._bindAll();
        
        this._camera = this._createCamera();
        this._slides = this._createSlides();
        this._debugFolder = this._createDebugFolder();
        
        this._setupEventListeners();
        this._track();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    update(time, delta, fps) {
        this._updatePosition();
        
        this._updateMousePosition();
        
        for (let i = 0; i < this._slides.length; i++) {
            const slide = this._slides[i];
            this._updateSlidePosition(slide);
            this._updateSlideMousePosition(slide);
            this._updateSlideSettings(slide);
            slide.update();
        }
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.fov = (180 * (2 * Math.atan(this._height / 2 / PESPECTIVE))) / Math.PI;
        this._camera.aspect = this._width/this._height;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Private
     */
    _createCamera() {
        const fov = (180 * (2 * Math.atan(this._height / 2 / PESPECTIVE))) / Math.PI;
        const camera = new PerspectiveCamera(fov, this._width / this._height, 0.1, 1000);
        camera.position.z = PESPECTIVE;
        return camera;
    }

    _createDebugFolder() {
        const folder = this._debugger.addFolder({ title: 'Slider' });

        folder.addInput(this._settings, 'damping', { min: 0, max: 1 });
        folder.addInput(this._settings, 'mouseDamping', { min: 0, max: 1 });
        folder.addInput(this._settings, 'mouseScale', { min: 0, max: 1 });

        const parallax = folder.addFolder({ title: 'Parallax' });
        parallax.addInput(this._settings.parallax, 'scale', { min: 1, max: 5 });

        const filters = folder.addFolder({ title: 'Filters' });
        filters.addInput(this._settings.filters, 'alphaFactor', { min: 0, max: 10 });
        filters.addInput(this._settings.filters, 'levelFactor', { min: 0, max: 10 });
        filters.addInput(this._settings.filters, 'saturationFactor', { min: 0, max: 10 });
        filters.addInput(this._settings.filters, 'brightnessFactor', { min: 0, max: 10 });

        return folder;
    }

    _createSlides() {
        const slides = [];
        let dragWidth = -this._width / 2 + this._settings.padding;

        const amount = 50;
        const padding = this._settings.padding * this._settings.scale;

        for (let i = 0; i < amount; i++) {
            const col = grid.columns[i % grid.columns.length];
            const colWidth = col.width * this._width * this._settings.scale;

            for (let j = 0; j < col.blocks.length; j++) {
                const block = col.blocks[j];
                const width = colWidth;
                const height = width * block.aspectRatio;

                const slide = new Slide({
                    index: i,
                    viewport: { width: this._width, height: this._height },
                    width,
                    height,
                    initialPosition: dragWidth + width / 2,
                    image: block.image,
                    settings: this._settings,
                });

                // Place in z space
                slide.position.z = block.order * this._settings.zPadding;
                
                this.add(slide);
                slides.push(slide);

                dragWidth += colWidth + padding;
            }

            // dragWidth += colWidth + this._settings.padding;
        }

        this.maxPosition = 0;
        this.minPosition = -dragWidth;

        return slides;
    }

    _track() {
        InertiaPlugin.track(this._position.target, 'x');
    }

    _throw() {
        this._throwTween = gsap.to(this._position.target, {
            inertia: {
                duration: { max: 1 },
                x: { min: this.minPosition, max: this.maxPosition },
            },
            modifiers: {
                x: (x) => {
                    return math.clamp(x, this.minPosition, this.maxPosition);
                },
            },
        });
    }

    // On Tick
    _updatePosition() {
        this._position.current.x = math.lerp(this._position.current.x, this._position.target.x, this._settings.damping);
    }

    _updateMousePosition() {
        this._mousePosition.current.x = math.lerp(this._mousePosition.current.x, this._mousePosition.target.x, this._settings.mouseDamping);
        this._mousePosition.current.y = math.lerp(this._mousePosition.current.y, this._mousePosition.target.y, this._settings.mouseDamping);
        
        this._normalizedMousePosition.current.x = math.lerp(this._normalizedMousePosition.current.x, this._normalizedMousePosition.target.x, this._settings.mouseDamping);
        this._normalizedMousePosition.current.y = math.lerp(this._normalizedMousePosition.current.y, this._normalizedMousePosition.target.y, this._settings.mouseDamping);
    }

    _updateSlidePosition(slide) {
        slide.position.x = this._position.current.x;
    }

    _updateSlideMousePosition(slide) {
        slide.mousePosition = this._mousePosition.current;
        slide.normalizedMousePosition = this._normalizedMousePosition.current;
    }
    
    _updateSlideSettings(slide) {
        for (let i = 0; i < this._slides.length; i++) {
            const slide = this._slides[i];
            slide.settings = this._settings;
        }
    }

    _bindAll() {
        this._dragstartHandler = this._dragstartHandler.bind(this);
        this._dragHandler = this._dragHandler.bind(this);
        this._dragendHandler = this._dragendHandler.bind(this);
        this._mousemoveHandler = this._mousemoveHandler.bind(this);
    }

    _setupEventListeners() {
        this._dragManager = new DragManager({ el: this._renderer.domElement });
        this._dragManager.addEventListener('dragstart', this._dragstartHandler);
        this._dragManager.addEventListener('drag', this._dragHandler);
        this._dragManager.addEventListener('dragend', this._dragendHandler);

        window.addEventListener('mousemove', this._mousemoveHandler);
    }

    _dragstartHandler(e) {
        this._throwTween?.kill();

        const { delta } = e;

        this._position.target.x -= delta.x;
        this._position.target.x = math.clamp(this._position.target.x, this.minPosition, this.maxPosition);
    }

    _dragHandler(e) {
        const { delta } = e;

        this._position.target.x -= delta.x;
        this._position.target.x = math.clamp(this._position.target.x, this.minPosition, this.maxPosition);
    }

    _dragendHandler() {
        this._throw();
    }

    _mousemoveHandler(e) {
        this._mousePosition.target.x = e.clientX;
        this._mousePosition.target.y = e.clientY;

        this._normalizedMousePosition.target.x = e.clientX / this._width;
        this._normalizedMousePosition.target.y = 1.0 - e.clientY / this._height;
    }
}

export default SceneSlider;