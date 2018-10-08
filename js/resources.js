export default class Resources {
    constructor() {
        this.resourceCache = {};
        this.loading = [];
        this.readyCallbacks = [];
    }

    load(urlOrArr) {
        if (urlOrArr instanceof Array) {
            urlOrArr.forEach((url) => {
                this._load(url);
            });
        } else {
            this._load(urlOrArr);
        }
    }

    _load(url) {
        if (this.resourceCache[url]) {
            return this.resourceCache[url];
        } else {
            let img = new Image();

            img.onload = () => {
                this.resourceCache[url] = img;

                if (this.isReady()) {
                    this.readyCallbacks.forEach((func) => { func(); });
                }
            };

            this.resourceCache[url] = false;
            img.src = url;
        }
    }

    get(url) {
        return this.resourceCache[url];
    }

    isReady() {
        let ready = true;

        for (let url in this.resourceCache) {
            if (this.resourceCache.hasOwnProperty(url) && !this.resourceCache[url]) {
                ready = false;
            }
        }

        return ready;
    }

    onReady(func) {
        this.readyCallbacks.push(func);
    }
}