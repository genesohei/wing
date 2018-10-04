(function (window) {
    'use strict';

    function Resources() {
        this.resourceCache = {};
        this.loading = [];
        this.readyCallbacks = [];
    }

    Resources.prototype.load = function (urlOrArr) {
        var that = this;

        if (urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                that._load(url);
            });
        } else {
            that._load(urlOrArr);
        }
    };

    Resources.prototype._load = function (url) {
        var that = this;

        if (that.resourceCache[url]) {
            return that.resourceCache[url];
        } else {
            var img = new Image();

            img.onload = function () {
                that.resourceCache[url] = img;

                if (that.isReady()) {
                    that.readyCallbacks.forEach(function(func) { func(); });
                }
            };

            that.resourceCache[url] = false;
            img.src = url;
        }
    };

    Resources.prototype.get = function (url) {
        return this.resourceCache[url];
    };

    Resources.prototype.isReady = function () {
        var ready = true;

        for (var url in this.resourceCache) {
            if (this.resourceCache.hasOwnProperty(url) && !this.resourceCache[url]) {
                ready = false;
            }
        }

        return ready;
    };

    Resources.prototype.onReady = function (func) {
        this.readyCallbacks.push(func);
    };

    // exports to window
    window.Resources = Resources;
})(window);