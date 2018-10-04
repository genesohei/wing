window.wing = window.wing || {};

(function (wing) {
    'use strict';

    function Wing(config) {
        this.resources = new Resources();
        this.input = new Input();
        this.game = new Game(config);

        this.bullets = [];
        this.enemies = [];
        this.explosions = [];

        this.lastFire = Date.now();
        this.isGameOver = 0;
        this.terrainPattern = 0;

        this.score = 0;
        this.scoreEl = null;

        this.playerSpeed = 200;
        this.bulletSpeed = 500;
        this.enemySpeed = 100;
    }

    Wing.prototype.boot = function () {
        var that = this;

        this.scoreEl = document.querySelector('#score');

        this.terrainPattern = this.game.context.createPattern(this.resources.get('img/terrain.png'), 'repeat');

        document.getElementById('game-start').addEventListener('click', function() {
            that.reset();
        });

        this.player = {
            pos: [0, 0],
            sprite: new Sprite(this.resources, {
                url: 'img/sprites.png',
                pos: [0, 0],
                size: [39, 39],
                speed: 16,
                frames: [0, 1]
            })
        };

        this.reset();

        this.game.update = this.update.bind(this);
        this.game.render = this.render.bind(this);

        this.game.start();

        this.input.init();
    };

    Wing.prototype.update = function (dt) {
        this.handleInput(dt);
        this.updateEntities(dt);

        if (this.needIncreaseDifficulty(this.game.time)) {
            this.enemies.push({
                pos: this.startingEnemyPosition(),
                sprite: new Sprite(this.resources, {
                    url: 'img/sprites.png',
                    pos: [0, 78],
                    size: [80, 39],
                    speed: 6,
                    frames: [0, 1, 2, 3, 2, 1]
                })
            });
        }

        this.checkCollisions();

        this.scoreEl.innerHTML = this.score;
    };

    Wing.prototype.startingEnemyPosition = function () {
        return [this.game.canvas.width, Math.random() * (this.game.canvas.height - 39)];
    };

    Wing.prototype.needIncreaseDifficulty = function (time) {
        return Math.random() < 1 - Math.pow(.993, time);
    };

    Wing.prototype.handleInput = function (dt) {
        if (this.input.isDown('DOWN') || this.input.isDown('s')) {
            this.player.pos[1] += this.playerSpeed * dt;
        }

        if (this.input.isDown('UP') || this.input.isDown('w')) {
            this.player.pos[1] -= this.playerSpeed * dt;
        }

        if (this.input.isDown('LEFT') || this.input.isDown('a')) {
            this.player.pos[0] -= this.playerSpeed * dt;
        }

        if (this.input.isDown('RIGHT') || this.input.isDown('d')) {
            this.player.pos[0] += this.playerSpeed * dt;
        }

        if (this.input.isDown('SPACE') && !this.isGameOver && Date.now() - this.lastFire > 100) {
            var x = this.player.pos[0] + this.player.sprite.size[0] / 2;
            var y = this.player.pos[1] + this.player.sprite.size[1] / 2;

            this.bullets.push({
                pos: [x, y],
                dir: 'forward',
                sprite: new Sprite(this.resources, {
                    url: 'img/sprites.png',
                    pos: [0, 39],
                    size: [18, 8]
                })
            });
            this.bullets.push({
                pos: [x, y],
                dir: 'up',
                sprite: new Sprite(this.resources, {
                    url: 'img/sprites.png',
                    pos: [0, 50],
                    size: [9, 5]
                })
            });
            this.bullets.push({
                pos: [x, y],
                dir: 'down',
                sprite: new Sprite(this.resources, {
                    url: 'img/sprites.png',
                    pos: [0, 60],
                    size: [9, 5]
                })
            });

            this.lastFire = Date.now();
        }
    };

    Wing.prototype.updateEntities = function (dt) {
        this.player.sprite.update(dt);

        for (var i = 0; i < this.bullets.length; i++) {
            var bullet = this.bullets[i];

            switch (bullet.dir) {
                case 'up':
                    bullet.pos[1] -= this.bulletSpeed * dt;

                    break;
                case 'down':
                    bullet.pos[1] += this.bulletSpeed * dt;

                    break;
                default:
                    bullet.pos[0] += this.bulletSpeed * dt;
            }

            if (
                bullet.pos[1] < 0 ||
                bullet.pos[1] > this.game.canvas.height ||
                bullet.pos[0] > this.game.canvas.width
            ) {
                this.bullets.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].pos[0] -= this.enemySpeed * dt;
            this.enemies[i].sprite.update(dt);

            if (this.enemies[i].pos[0] + this.enemies[i].sprite.size[0] < 0) {
                this.enemies.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < this.explosions.length; i++) {
            this.explosions[i].sprite.update(dt);

            if (this.explosions[i].sprite.done) {
                this.explosions.splice(i, 1);
                i--;
            }
        }
    };

    Wing.prototype.collides = function (x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 || b <= y2 || y > b2);
    };

    Wing.prototype.boxCollides = function (pos, size, pos2, size2) {
        return this.collides(
            pos[0], pos[1],
            pos[0] + size[0], pos[1] + size[1],
            pos2[0], pos2[1],
            pos2[0] + size2[0], pos2[1] + size2[1]
        );
    };

    Wing.prototype.checkCollisions = function () {
        this.checkPlayerBounds();

        for (var i = 0; i < this.enemies.length; i++) {
            var pos = this.enemies[i].pos;
            var size = this.enemies[i].sprite.size;

            for (var j = 0; j < this.bullets.length; j++) {
                var pos2 = this.bullets[j].pos;
                var size2 = this.bullets[j].sprite.size;

                if (this.boxCollides(pos, size, pos2, size2)) {
                    this.enemies.splice(i, 1);
                    i--;

                    this.score += 100;

                    this.explosions.push({
                        pos: pos,
                        sprite: new Sprite(this.resources, {
                            url: 'img/sprites.png',
                            pos: [0, 117],
                            size: [39, 39],
                            speed: 16,
                            frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                            dir: null,
                            once: true
                        })
                    });

                    this.bullets.splice(j, 1);

                    break;
                }
            }

            if (this.boxCollides(pos, size, this.player.pos, this.player.sprite.size)) {
                this.gameOver();
            }
        }
    };

    Wing.prototype.checkPlayerBounds = function () {
        if (this.player.pos[0] < 0) {
            this.player.pos[0] = 0;
        } else if (this.player.pos[0] > this.game.canvas.width - this.player.sprite.size[0]) {
            this.player.pos[0] = this.game.canvas.width - this.player.sprite.size[0];
        }

        if (this.player.pos[1] < 0) {
            this.player.pos[1] = 0;
        } else if (this.player.pos[1] > this.game.canvas.height - this.player.sprite.size[1]) {
            this.player.pos[1] = this.game.canvas.height - this.player.sprite.size[1];
        }
    };

    Wing.prototype.render = function () {
        this.game.context.fillStyle = this.terrainPattern;
        this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        if (!this.isGameOver) {
            this.renderEntity(this.player);
        }

        this.renderEntities(this.bullets);
        this.renderEntities(this.enemies);
        this.renderEntities(this.explosions);
    };

    Wing.prototype.renderEntities = function (list) {
        for (var i = 0; i < list.length; i++) {
            this.renderEntity(list[i]);
        }
    };

    Wing.prototype.renderEntity = function (entity) {
        this.game.context.save();
        this.game.context.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(this.game.context);
        this.game.context.restore();
    };

    Wing.prototype.gameOver = function () {
        document.getElementById('over').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';

        this.isGameOver = true;
    };

    Wing.prototype.reset = function () {
        document.getElementById('over').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';

        this.game.resetTime();

        this.isGameOver = false;
        this.score = 0;

        this.enemies = [];
        this.bullets = [];

        this.player.pos = [50, this.game.canvas.height / 2];
    };

    wing = new Wing(800, 600);

    wing.resources.load([
        'img/sprites.png',
        'img/terrain.png'
    ]);
    wing.resources.onReady(wing.boot.bind(wing));

    // exports to window
    window.wing = wing;
})(window.wing);