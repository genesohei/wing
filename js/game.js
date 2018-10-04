(function (window) {
    'use strict';

    function Game(width, height, update, render) {
        this.width = 800;
        this.height = 600;
        this.update = null;
        this.render = null;

        this.canvas = null;
        this.context = null;

        this.time = 0;
        this.lastTime = Date.now();
        this.now = 0;
        this.deltaTime = 0;

        this.parseConfig(arguments[0]);

        var vendors = [
            'ms',
            'moz',
            'webkit',
            'o'
        ];

        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
    }

    Game.prototype.parseConfig = function (config) {
        if (config.width) {
            this.width = config.width;
        }

        if (config.height) {
            this.height = config.height;
        }

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        document.body.appendChild(this.canvas);
    };

    Game.prototype.animate = function () {
        this.now = Date.now();
        this.deltaTime = (this.now - this.lastTime) / 1000.0;
        this.time += this.deltaTime;
        this.lastTime = this.now;

        this.update(this.deltaTime);
        this.render();
    };

    Game.prototype.start = function () {
        this.isRunning = true;

        var that = this;

        if (!window.requestAnimationFrame) {
            this.isSetTimeOut = true;

            this._onLoop = function () {
                return that.updateSetTimeout();
            };

            this.timeOutID = window.setTimeout(this._onLoop, 0);
        } else {
            this.isSetTimeOut = false;

            this._onLoop = function (time) {
                return that.updateRAF(time);
            };

            this.timeOutID = window.requestAnimationFrame(this._onLoop);
        }
    };

    Game.prototype.updateRAF = function () {
        if (this.isRunning) {
            this.animate();

            this.timeOutID = window.requestAnimationFrame(this._onLoop);
        }
    };

    Game.prototype.updateSetTimeout = function () {
        if (this.isRunning) {
            this.animate();

            this.timeOutID = window.setTimeout(this._onLoop);
        }
    };

    Game.prototype.stop = function () {
        if (this.isSetTimeOut) {
            clearTimeout(this.timeOutID);
        } else {
            window.cancelAnimationFrame(this.timeOutID);
        }

        this.isRunning = false;
    };

    Game.prototype.resetTime = function () {
        this.time = 0;
    };

    // exports to window
    window.Game = Game;
})(window);