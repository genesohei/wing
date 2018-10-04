(function(window) {
    'use strict';

    function Input() {
        this.pressedKeys = {};
    }

    Input.prototype.init = function () {
        var that = this;

        document.addEventListener('keydown', function(e) {
            that.setKey(e, true);
        });

        document.addEventListener('keyup', function(e) {
            that.setKey(e, false);
        });

        window.addEventListener('blur', function() {
            that.pressedKeys = {};
        });
    };

    Input.prototype.setKey = function (event, status) {
        var code = event.keyCode;
        var key;

        switch (code) {
            case 32:
                key = 'SPACE';

                break;
            case 37:
                key = 'LEFT';

                break;
            case 38:
                key = 'UP';

                break;
            case 39:
                key = 'RIGHT';

                break;
            case 40:
                key = 'DOWN';

                break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(code);
        }

        this.pressedKeys[key] = status;
    };

    Input.prototype.isDown = function (key) {
        return this.pressedKeys[key.toUpperCase()];
    };

    // exports to window
    window.Input = Input;
})(window);