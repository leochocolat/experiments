// Vendors
import { Mesh, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, TextureLoader, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

// Shaders
import vertex from '../shaders/levels/vertex.glsl';
import fragment from '../shaders/levels/fragment.glsl';

class SceneLevels extends Scene {
    constructor(options = {}) {
        super();

        this._width = options.width;
        this._height = options.height;
        this._debugger = options.debugger;
        this._renderer = options.renderer;

        this._settings = {
            animation: 'levelFade',
            timeScale: 1,
            progress: 0,
            animationOptions: {
                basicFade: 'basicFade',
                levelFade: 'levelFade',
                levelFadeWithBrightness: 'levelFadeWithBrightness',
                // Enable mask in shader to use this animation
                levelFadeWithRevealX: 'levelFadeWithRevealX',
            }
        }

        this._bindAll();

        this._texture = this._createTexture();
        this._camera = this._createCamera();
        this._controls = this._createControls();
        this._plane = this._createPlane();

        this._debugFolder = this._createDebugFolder();

        this._isVisible = true;
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    update(time, delta, fps) {
        this._plane.material.uniforms.u_time.value = time;
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.aspect = this._width / this._height;
        this._camera.updateProjectionMatrix();
    }

    show() {
        this.timelineHide?.kill();
        this.timelineShow = new gsap.timeline();
        this.timelineShow.timeScale(this._settings.timeScale);

        switch (this._settings.animation) {
            case 'basicFade':
                this.timelineShow.add(this.showBasicFade(), 0);
                break;
            case 'levelFade':
                this.timelineShow.add(this.showLevelFade(), 0);
                break;
            case 'levelFadeWithBrightness':
                this.timelineShow.add(this.showLevelFadeWithBrightness(), 0);
                break;
            case 'levelFadeWithRevealX':
                this.timelineShow.add(this.showLevelFadeWithRevealX(), 0);
                break;
        }
    }
    
    hide() {
        this.timelineShow?.kill();
        this.timelineHide = new gsap.timeline();
        this.timelineHide.timeScale(this._settings.timeScale);

        switch (this._settings.animation) {
            case 'basicFade':
                this.timelineHide.add(this.hideBasicFade(), 0);
                break;
            case 'levelFade':
                this.timelineHide.add(this.hideLevelFade(), 0);   
                break;
            case 'levelFadeWithBrightness':
                this.timelineHide.add(this.hideLevelFadeWithBrightness(), 0);   
                break;
            case 'levelFadeWithRevealX':
                this.timelineHide.add(this.hideLevelFadeWithRevealX(), 0);   
                break;
        }
    }

    // Level
    showLevelFade() {
        const timeline = new gsap.timeline();

        timeline.to(this._plane.material.uniforms.u_level, { duration: 1.5, value: 1, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_saturation, { duration: 1.5, value: 1, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 1.5, value: 1, ease: 'sine.out' }, 0);
        timeline.fromTo(this._plane.material.uniforms.u_scale, { value: 1.2 }, { duration: 1.5, value: 1, ease: 'sine.out' }, 0);

        return timeline;
    }

    hideLevelFade() {
        const timeline = new gsap.timeline();

        timeline.to(this._plane.material.uniforms.u_level, { duration: 1.5, value: 0, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_saturation, { duration: 1.5, value: 0, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 1.5, value: 0, ease: 'sine.out' }, 0);

        return timeline;
    }

    // Level + Brightness
    showLevelFadeWithBrightness() {
        const timeline = new gsap.timeline();

        timeline.to(this._plane.material.uniforms.u_level, { duration: 1, value: 1, ease: 'sine.out' }, 0);
        timeline.to(this._plane.material.uniforms.u_saturation, { duration: 1, value: 1, ease: 'sine.out' }, 0);
        timeline.to(this._plane.material.uniforms.u_brightness, { duration: 2, value: 1, ease: 'sine.out' }, 0);
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 2, value: 1, ease: 'sine.out' }, 0);

        return timeline;
    }

    hideLevelFadeWithBrightness() {
        const timeline = new gsap.timeline();

        timeline.to(this._plane.material.uniforms.u_brightness, { duration: 2, value: 5 }, 0);
        timeline.to(this._plane.material.uniforms.u_level, { duration: 1, value: 0, ease: 'sine.out' }, 0);
        timeline.to(this._plane.material.uniforms.u_saturation, { duration: 1, value: 0, ease: 'sine.out' }, 0);
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 2, value: 0, ease: 'sine.out' }, 0);

        return timeline;
    }

    showLevelFadeWithRevealX() {
        const timeline = new gsap.timeline();
        
        timeline.to(this._plane.material.uniforms.u_level, { duration: 1.5, value: 1, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_saturation, { duration: 1.5, value: 1, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_uv_offset_x, { duration: 1.5, value: 0, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 1.5, value: 1, ease: 'sine.in' }, 0);

        return timeline;
    }

    hideLevelFadeWithRevealX() {
        const timeline = new gsap.timeline();
        
        timeline.to(this._plane.material.uniforms.u_level, { duration: 1.5, value: 0, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_saturation, { duration: 1.5, value: 0, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_uv_offset_x, { duration: 1.5, value: 1, ease: 'sine.inOut' }, 0);
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 1.5, value: 0, ease: 'sine.in' }, 0);

        return timeline;
    }

    // Alpha
    showBasicFade() {
        const timeline = new gsap.timeline();

        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 1, value: 1 }, 0);

        return timeline;
    }

    hideBasicFade() {
        const timeline = new gsap.timeline();
        
        timeline.to(this._plane.material.uniforms.u_alpha, { duration: 1, value: 0 }, 0);

        return timeline;
    }

    /**
     * Private
     */
    _createTexture() {
        const texture = new TextureLoader().load('https://source.unsplash.com/KxRNb1Cch8c');
        return texture;
    }

    _createCamera() {
        const camera = new PerspectiveCamera(75, this._width / this._height, 0.1, 1000);
        camera.position.z = 0.8;
        return camera;
    }

    _createControls() {
        const controls = new OrbitControls(this._camera, this._renderer.domElement);

        return controls;
    }

    _createPlane() {
        const geometry = new PlaneGeometry(1, 1, 1);

        const material = new ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                u_time: { value: 0 },
                u_resolution: { value: new Vector2(1, 1) },
                u_texture: { value: this._texture },
                u_aspect_ratio: { value: new Vector2(720, 1080) },
                // Fade
                u_alpha: { value: 1 },
                // Level
                u_level_min: { value: 0 },
                u_level_max: { value: 1 },
                u_level: { value: 1 },
                // Sat / Bright / Contrast
                u_saturation: { value: 1 },
                u_brightness: { value: 1 },
                u_contrast: { value: 1 },
                // Progress
                u_uv_offset_x: { value: 0 },
                // Scale
                u_scale: { value: 1 },
            }
        });

        const mesh = new Mesh(geometry, material);

        this.add(mesh);

        return mesh;
    }

    _createDebugFolder() {
        const folder = this._debugger.addFolder({ title: 'Levels' });

        folder.addInput(this._plane.material.uniforms.u_alpha, 'value', { min: 0, max: 1, label: 'Alpha' });

        folder.addInput(this._plane.material.uniforms.u_level_min, 'value', { min: 0, max: 1, label: 'Level Min' });
        folder.addInput(this._plane.material.uniforms.u_level_max, 'value', { min: 0, max: 1, label: 'Level Max' });
        folder.addInput(this._plane.material.uniforms.u_level, 'value', { min: 0, max: 2, label: 'Level' });

        folder.addInput(this._plane.material.uniforms.u_saturation, 'value', { min: 0, max: 2, label: 'Saturation' });
        folder.addInput(this._plane.material.uniforms.u_brightness, 'value', { min: 0, max: 10, label: 'Brightness' });
        folder.addInput(this._plane.material.uniforms.u_contrast, 'value', { min: 0, max: 2, label: 'Contrast' });

        folder.addInput(this._plane.material.uniforms.u_uv_offset_x, 'value', { min: 0, max: 1, label: 'Offset X' });

        const animations = folder.addFolder({ title: 'Animations' });
        animations.addInput(this._settings, 'animation', { options: this._settings.animationOptions });
        animations.addInput(this._settings, 'timeScale', { min: 0, max: 2 });
        animations.addButton({ title: 'Fade' }).on('click', this._fadeClickHandler);
        animations.addButton({ title: 'Reset' }).on('click', this._resetClickHandler);

        return folder;
    }

    _bindAll() {
        this._fadeClickHandler = this._fadeClickHandler.bind(this);
        this._resetClickHandler = this._resetClickHandler.bind(this);
    }

    _fadeClickHandler() {
        if (this._isVisible) {
            this.hide();
        } else {
            this.show();
        }

        this._isVisible = !this._isVisible;
    }

    _resetClickHandler() {
        this._isVisible = true;
        this.timelineHide?.kill();
        this.timelineShow?.kill();
        this._plane.material.uniforms.u_alpha.value = 1;
        this._plane.material.uniforms.u_saturation.value = 1;
        this._plane.material.uniforms.u_brightness.value = 1;
        this._plane.material.uniforms.u_contrast.value = 1;
        this._plane.material.uniforms.u_level_min.value = 0;
        this._plane.material.uniforms.u_level_max.value = 1;
        this._plane.material.uniforms.u_level.value = 1;
        this._plane.material.uniforms.u_uv_offset_x.value = 1;
    }
}

export default SceneLevels;