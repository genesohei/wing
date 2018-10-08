export default class Game {
    constructor(width, height, parent, update, render) {
        this.width = 800;
        this.height = 600;
        this.parent = '';
        this.update = null;
        this.render = null;

        this.canvas = null;
        this.context = null;

        this.time = 0;
        this.lastTime = Date.now();
        this.now = 0;
        this.deltaTime = 0;

        const vendors = [
            'ms',
            'moz',
            'webkit',
            'o'
        ];

        for (let x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (arguments.length === 1 && typeof arguments[0] === 'object') {
            this.parseConfig(arguments[0]);
        } else {
            if (width) {
                this.width = width;
            }

            if (height) {
                this.height = height;
            }

            if (parent) {
                this.parent = parent;
            }
        }

        this.createCanvas();

        this.addToDOM();
    }

    parseConfig(config) {
        if (config.width) {
            this.width = config.width;
        }

        if (config.height) {
            this.height = config.height;
        }

        if (config.parent) {
            this.parent = config.parent;
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    addToDOM() {
        const $content = document.getElementById(this.parent) || document.body;

        if ($content) {
            $content.appendChild(this.canvas);
        }
    }

    animate() {
        this.now = Date.now();
        this.deltaTime = (this.now - this.lastTime) / 1000.0;
        this.time += this.deltaTime;
        this.lastTime = this.now;

        this.update(this.deltaTime);
        this.render();
    }

    start() {
        this.isRunning = true;

        if (!window.requestAnimationFrame) {
            this.isSetTimeOut = true;

            this._onLoop = () => {
                return this.updateSetTimeout();
            };

            this.timeOutID = window.setTimeout(this._onLoop, 0);
        } else {
            this.isSetTimeOut = false;

            this._onLoop = (time) => {
                return this.updateRAF(time);
            };

            this.timeOutID = window.requestAnimationFrame(this._onLoop);
        }
    }

    updateRAF() {
        if (this.isRunning) {
            this.animate();

            this.timeOutID = window.requestAnimationFrame(this._onLoop);
        }
    }

    updateSetTimeout() {
        if (this.isRunning) {
            this.animate();

            this.timeOutID = window.setTimeout(this._onLoop);
        }
    }

    stop() {
        if (this.isSetTimeOut) {
            clearTimeout(this.timeOutID);
        } else {
            window.cancelAnimationFrame(this.timeOutID);
        }

        this.isRunning = false;
    }

    resetTime() {
        this.time = 0;
    }
}