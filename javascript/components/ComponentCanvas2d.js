// Vendor
import gsap from 'gsap';
import Simplex from 'perlin-simplex';

// Utils
import WindowResizeObserver from '../utils/WindowResizeObserver';

const POINTS_AMOUNT = 100;
const LINES_AMOUNT = 100;

class ComponentCanvas2d {
    constructor(options) {
        this.el = options.el;

        this._time = 0;

        this._canvas = this.el;
        this._ctx = this._canvas.getContext('2d');

        this._width = WindowResizeObserver.width;
        this._height = WindowResizeObserver.height;

        this._simplex = new Simplex();

        this._lines = this._createLines();

        this._resizeCanvas();

        this._bindAll();
        this._setupEventListeners();
    }

    _createLines() {
        const lines = [];

        for (let i = 0; i <= LINES_AMOUNT; i++) {
            const line = { points: [] };
            const linePositionY = this._height / LINES_AMOUNT * i;

            for (let j = 0; j <= POINTS_AMOUNT; j++) {
                const point = {
                    x: this._width / POINTS_AMOUNT * j,
                    y: linePositionY,
                    y: linePositionY + this._simplex.noise(i * Math.sin(this._time), j) * 10,
                };

                line.points.push(point);
            }

            lines.push(line);
        }

        return lines;
    }

    _resize() {
        this._width = WindowResizeObserver.width;
        this._height = WindowResizeObserver.height;        

        this._resizeCanvas();
    }

    _resizeCanvas() {
        this._canvas.width = this._width;
        this._canvas.height = this._height;
    }

    _draw() {
        this._ctx.fillRect(0, 0, this._width, this._height);

        this._drawLines();   
    }
    
    _drawLines() {
        for (let i = 0; i < this._lines.length; i++) {
            const line = this._lines[i];
            this._drawLine(line);
        }
    }

    _drawLine(line) {
        this._ctx.beginPath();
        this._ctx.strokeStyle = 'red';
        this._ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let i = 0; i < line.points.length; i++) {
            const point = line.points[i];
            this._ctx.lineTo(point.x, point.y);
        }
        this._ctx.stroke();
        this._ctx.closePath();
    }

    _bindAll() {
        this._tickHandler = this._tickHandler.bind(this);
        this._resizeHandler = this._resizeHandler.bind(this);
    }

    _setupEventListeners() {
        gsap.ticker.add(this._tickHandler);
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
    }

    _tickHandler() {
        this._time += 0.001;
        this._lines = this._createLines();
        this._draw();
    }

    _resizeHandler() {
        this._resize();
    }
}

export default ComponentCanvas2d;

// for (let i = 0; i < this._points.length; i++) {
//     const startPoint = this._points[i];
//     const endPoint = this._points[i + 1] ? this._points[i + 1] : startPoint;
//     this._ctx.lineTo(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
// }