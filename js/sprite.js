(function(window) {
    function Sprite(resources, opts) {
        opts = opts || {};

        /**
         * @property {Resources} resources - the resources loader
         */
        this.resources = resources;
        /**
         * @property {string} url - the path to the image
         */
        this.url = opts.url;
        /**
         * @property {array} pos - the x and y coordinate in the image for this sprite
         */
        this.pos = opts.pos;
        /**
         * @property {array} size - size of the sprite (just one keyframe)
         */
        this.size = opts.size;
        /**
         * @property {number} speed - speed in frames/sec for animating
         */
        this.speed = typeof opts.speed === 'number' ? opts.speed : 0;
        /**
         * @property {array} frames - an array of frame indexes for animating: [0, 1, 2, 1]
         */
        this.frames = opts.frames;
        /**
         * @property {string} dir - which direction to move in the sprite map when animating: 'horizontal' (default) or 'vertical'
         */
        this.dir = opts.dir || 'horizontal';
        /**
         * @property {boolean} once - true to only run the animation once, defaults to false
         */
        this.once = opts.once;
        this._index = 0;
    }

    Sprite.prototype.update = function (dt) {
        this._index += this.speed * dt;
    };

    Sprite.prototype.render = function(context) {
        var frame;

        if (this.speed > 0) {
            var max = this.frames.length;
            var idx = Math.floor(this._index);

            frame = this.frames[idx % max];

            if (this.once && idx >= max) {
                this.done = true;
                return;
            }
        } else {
            frame = 0;
        }

        var x = this.pos[0];
        var y = this.pos[1];

        if (this.dir === 'vertical') {
            y += frame * this.size[1];
        } else {
            x += frame * this.size[0];
        }

        context.drawImage(
            this.resources.get(this.url),
            x, y,
            this.size[0], this.size[1],
            0, 0,
            this.size[0], this.size[1]
        );
    };

    // exports to window
    window.Sprite = Sprite;
})(window);