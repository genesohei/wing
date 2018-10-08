import '../css/app.scss';
import Resources from './resources';
import Input from './input';
import Sprite from './sprite';
import Game from './game';

class Wing {
    constructor() {
        this.resources = new Resources();
        this.input = new Input();
        this.game = new Game(800, 600, 'game-content');

        this.bullets = [];
        this.enemies = [];
        this.explosions = [];

        this.lastFire = Date.now();
        this.isGameOver = 0;
        this.terrainPattern = 0;

        this.score = 0;
        this.$score = null;

        this.$overlay = null;
        this.$over = null;
        this.$start = null;

        this.playerSpeed = 200;
        this.bulletSpeed = 500;
        this.enemySpeed = 100;
    }

    boot() {
        this.terrainPattern = this.game.context.createPattern(this.resources.get('img/terrain.png'), 'repeat');

        this.$overlay = document.querySelector('#game-overlay');
        this.$over = document.querySelector('#game-over');
        this.$score = document.querySelector('#game-score');
        this.$start = document.querySelector('#game-start');

        this.$start.addEventListener('click', () => {
            this.reset();
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

        this.input.boot();
        this.game.start();
    }

    update(dt) {
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

        this.$score.innerHTML = this.score;
    }

    startingEnemyPosition() {
        return [this.game.canvas.width, Math.random() * (this.game.canvas.height - 39)];
    }

    needIncreaseDifficulty(time) {
        return Math.random() < 1 - Math.pow(.993, time);
    }

    handleInput(dt) {
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
            let x = this.player.pos[0] + this.player.sprite.size[0] / 2;
            let y = this.player.pos[1] + this.player.sprite.size[1] / 2;

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
    }

    updateEntities(dt) {
        this.player.sprite.update(dt);

        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];

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

        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].pos[0] -= this.enemySpeed * dt;
            this.enemies[i].sprite.update(dt);

            if (this.enemies[i].pos[0] + this.enemies[i].sprite.size[0] < 0) {
                this.enemies.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.explosions.length; i++) {
            this.explosions[i].sprite.update(dt);

            if (this.explosions[i].sprite.done) {
                this.explosions.splice(i, 1);
                i--;
            }
        }
    }

    collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 || b <= y2 || y > b2);
    }

    boxCollides(pos, size, pos2, size2) {
        return this.collides(
            pos[0], pos[1],
            pos[0] + size[0], pos[1] + size[1],
            pos2[0], pos2[1],
            pos2[0] + size2[0], pos2[1] + size2[1]
        );
    }

    checkCollisions() {
        this.checkPlayerBounds();

        for (let i = 0; i < this.enemies.length; i++) {
            let pos = this.enemies[i].pos;
            let size = this.enemies[i].sprite.size;

            for (let j = 0; j < this.bullets.length; j++) {
                let pos2 = this.bullets[j].pos;
                let size2 = this.bullets[j].sprite.size;

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
    }

    checkPlayerBounds() {
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
    }

    render() {
        this.game.context.fillStyle = this.terrainPattern;
        this.game.context.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        if (!this.isGameOver) {
            this.renderEntity(this.player);
        }

        this.renderEntities(this.bullets);
        this.renderEntities(this.enemies);
        this.renderEntities(this.explosions);
    }

    renderEntities(list) {
        for (let i = 0; i < list.length; i++) {
            this.renderEntity(list[i]);
        }
    }

    renderEntity(entity) {
        this.game.context.save();
        this.game.context.translate(entity.pos[0], entity.pos[1]);
        entity.sprite.render(this.game.context);
        this.game.context.restore();
    }

    gameOver() {
        this.$over.style.display = 'block';
        this.$overlay.style.display = 'block';

        this.isGameOver = true;
    }

    reset() {
        this.$over.style.display = 'none';
        this.$overlay.style.display = 'none';

        this.game.resetTime();

        this.isGameOver = false;
        this.score = 0;

        this.enemies = [];
        this.bullets = [];

        this.player.pos = [50, this.game.canvas.height / 2];
    }
}

let wing = new Wing();

wing.resources.load([
    'img/sprites.png',
    'img/terrain.png'
]);
wing.resources.onReady(wing.boot.bind(wing));