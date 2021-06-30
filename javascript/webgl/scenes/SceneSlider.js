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
            padding: 200,
            zPadding: 50,
            parallax: {
                scale: 1.5
            }
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
        this._updateSlidesPosition();
        this._updateSlidesSettings();
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

        const parallax = folder.addFolder({ title: 'Parallax' });
        parallax.addInput(this._settings.parallax, 'scale', { min: 1, max: 5 });

        return folder;
    }

    _createSlides() {
        const slides = [];
        let dragWidth = 0;

        for (let i = 0; i < grid.columns.length; i++) {
            const col = grid.columns[i];

            for (let j = 0; j < col.blocks.length; j++) {
                const block = col.blocks[j];
                const width = block.width * this._width / 4;
                const height = width * block.aspectRatio;

                const slide = new Slide({
                    viewport: { width: this._width, height: this._height },
                    width,
                    height,
                    initialPosition: dragWidth,
                    image: block.image,
                    imageScale: this._settings.parallax.scale
                });
    
                dragWidth += slide.width + this._settings.padding;

                // Place in z space
                slide.position.z = block.order * this._settings.zPadding;
                
                this.add(slide);
                slides.push(slide);   
            }
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

    _updateSlidesPosition() {
        for (let i = 0; i < this._slides.length; i++) {
            const slide = this._slides[i];
            slide.position.x = this._position.current.x;
        }
    }
    
    _updateSlidesSettings() {
        for (let i = 0; i < this._slides.length; i++) {
            const slide = this._slides[i];
            slide.imageScale = this._settings.parallax.scale;
        }
    }

    _bindAll() {
        this._dragstartHandler = this._dragstartHandler.bind(this);
        this._dragHandler = this._dragHandler.bind(this);
        this._dragendHandler = this._dragendHandler.bind(this);
    }

    _setupEventListeners() {
        this._dragManager = new DragManager({ el: this._renderer.domElement });
        this._dragManager.addEventListener('dragstart', this._dragstartHandler);
        this._dragManager.addEventListener('drag', this._dragHandler);
        this._dragManager.addEventListener('dragend', this._dragendHandler);
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
}

export default SceneSlider;