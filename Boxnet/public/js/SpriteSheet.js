class SpriteSheet {
    constructor(path) {
        this.sprites = [];
        this.img = null;
        this.readImageFromFile(path + ".png")
        this.readJsonFromFile(path + ".json");
        this.animations = [];
        this.variants = [];
    }

    get defaultSprite() {
        return this.sprites["default"] | this.sprites[0];
    }

    readImageFromFile(path) {
        var img = new Image;
        var that = this;
        img.onload = function () {
            that.img = img;
        }
        img.src = path;//URL.createObjectURL(path);
    }

    readJsonFromFile(path) {
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
                //Check if it has variants
                else if (!isNan(spriteName.substring(spriteName.length - 2))) {
                    var variant = spriteName.substring(spriteName.length - 2);
                    this.addVariant(variant, sprite);
                }
            }

            //Add animations
            for (var aName in anims) {
                that.addAnimation(aName, anims[aName]);
            }
        });
    }

    getVariantNum(variant) {
        if (this.variants[variant])
            return this.variants[variant].length;
        return 1;
    }

    addVariant(variant, sprite) {
        if (this.variants[variant] == null)
            this.variants[variant] = [];
        this.variants[variant].push = sprite;
    }

    update(ms) {
        for (var a in this.animations)
            this.animations[a].update(ms);
    }

    drawSprite(ctx, spriteName, x, y, w, h, variant = 0) {
        //console.log("draw sprite", spriteName);
        var sprite = (variant > 0) ? this.variants[variant] : this.sprites[spriteName]
        if (sprite)
            sprite.draw(ctx, x, y, w, h);
        else
            this.defaultSprite.draw(ctx, x, y, w, h);
    }

    addAnimation(name, sprites) {
        this.animations[name] = new AnimatedSprite(sprites);
        console.log("anim", name, this.animations[name].sprites);
    }

    getAnimation(name) {
        return this.animations[name];
    }

    getSprite(name) {
        return this.sprites[name];
    }

    drawAnimation(ctx, animName, x, y, w, h) {
        console.log("draw animation", animName);
        var anim = this.animations[animName];
        if (anim)
            anim.draw(ctx, x, y, w, h);
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
    }

    getFrame(iFrame) {
        return this.sprites[iFrame];
    }

    get frameCount() {
        return this.sprites.length;
    }

    draw(ctx, x, y, w, h) {
        this.sprite.draw(ctx, x, y, w, h);
    }
}