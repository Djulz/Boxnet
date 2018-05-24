class SpriteSheet {
    constructor(path) {
        this.sprites = [];
        this.readFromFile("./../data/spritesheet.json");
        this.animations = [];
    }

    readFromFile(path) {
        var that = this;

        $.getJSON(path, function (data) {

            var anims = [];
            for (var spriteKey in data) {
                var d = data[spriteKey];
                var spriteName = spriteKey.substring(spriteKey.lastIndexOf('/') + 1);
                console.log(spriteName);
                console.log(data);
                console.log(d);
                var sprite = new Sprite(that, d.frame.x, d.frame.y, d.frame.width, d.frame.height);
                console.log(sprite.x, sprite.y, sprite.w, sprite.h);
                that.sprites[spriteName] = sprite;

                //Check if animated
                if (spriteName.substring(0, 2) == "a_") {
                    var animName = spriteName.substring(2, spriteName.length - 2);
                    console.log(animName);
                    if (anims[animName] == null)
                        anims[animName] = [];
                    anims[animName].push(sprite);
                }
            }

            //Add animations
            for (var aName in anims) {
                that.addAnimation(aName, anims[aName]);
            }
        });


    }

    addAnimation(name, sprites) {
        this.animations[name] = new AnimatedSprite(sprites);
        console.log("anim", name, this.animations[name].sprites);
    }
}

class Sprite {
    constructor(sheet, x, y, w, h) {
        this.sheet = sheet;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx, x, y, w, h) {
        ctx.drawImage(this.sheet.img, this.x, this.y, this.w, this.h, x, y, w, h);
    }
}

class AnimatedSprite {
    constructor(sprites) {
        this.sprites = sprites;
        this.currentFrame = 0;
        this._fps = 10;
        this.frameTimePassed = 0;
    }

    set fps(i) {
        this._fps = i;
        this._frameTime = i / 1000.0;
    }

    get sprite() {
        return this.sprites[this.currentFrame];
    }

    setFrame(i) {
        this.currentFrame = i % this.sprites.length;
    }

    nextFrame() {
        this.setFrame(this.currentFrame++);
    }

    update(ms) {
        this.frameTimePassed += ms;
        while (this.frameTimePassed >= this._frameTime) {
            this.frameTimePassed -= this._frameTime;
            this.nextFrame();
        }
    }

    draw(ctx, x, y, w, h) {
        this.sprite.draw(ctx, x, y, w, h);
    }
}