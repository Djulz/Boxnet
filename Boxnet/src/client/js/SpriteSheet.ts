import * as $ from "jquery";

interface IMyType {
    [index: string]: Sprite[];
}

const spriteDefaultName: string = "default";

export class SpriteSheet {
    sprites: Sprite[];
    img: any;
    animations: AnimatedSprite[];
    variants: IMyType;

    constructor(path: string) {
        this.sprites = [];
        this.img = null;
        this.readImageFromFile(path + ".png");
        this.readJsonFromFile(path + ".json");
        this.animations = [];
        //this.variants = [] as MyType;
    }

    get defaultSprite(): Sprite {
        return this.sprites[spriteDefaultName] || this.sprites[0];
    }

    readImageFromFile(path: string): void {
        const img: HTMLImageElement = new Image();
        const that: SpriteSheet = this;
        img.onload = () => {
            that.img = img;
        };
        img.src = path; // uRL.createObjectURL(path);
    }

    readJsonFromFile(path: string): void {
        const that: SpriteSheet = this;

        $.getJSON(path, (data) => {

            const anims = [];
            for (const spriteKey in data) {
                if (data[spriteKey]) {
                    const d = data[spriteKey];
                    const spriteName = spriteKey.substring(spriteKey.lastIndexOf("/") + 1);
                    console.log(spriteName);
                    console.log(data);
                    console.log(d);
                    const sprite = new Sprite(that, d.frame.x, d.frame.y, d.frame.width, d.frame.height);
                    console.log(sprite.x, sprite.y, sprite.w, sprite.h);
                    that.sprites[spriteName] = sprite;

                    // check if animated
                    if (spriteName.substring(0, 2) === "a_") {
                        const animName = spriteName.substring(2, spriteName.length - 2);
                        console.log(animName);
                        if (anims[animName] == null) {
                            anims[animName] = [];
                        }
                        anims[animName].push(sprite);
                    } else if (!isNaN(+spriteName.substring(spriteName.length - 2))) {
                        const variant = spriteName.substring(0, spriteName.length - 2);
                        that.addVariant(variant, sprite);
                    }
                }
            }

            // add animations
            for (const aName in anims) {
                if (anims[aName])
                    that.addAnimation(aName, anims[aName]);
            }
        });
    }

    getVariantNum(variant: number): number {
        if (this.variants[variant]) {
            return this.variants[variant].length;
        }
        return 1;
    }

    addVariant(variant: string, sprite: Sprite) {
        if (this.variants[variant] == null) {
            this.variants[variant] = [];
        }
        this.variants[variant].push(sprite);
    }

    // update(ms) {
    //     for (var a in this.animations)
    //         this.animations[a].update(ms);
    // }

    drawSprite(ctx:CanvasRenderingContext2D, spriteName: string, x: number, y: number, w: number, h: number, variant: number = -1): void {
        // console.log("draw sprite", spriteName);
        const sprite = (variant >= 0) ? this.variants[spriteName][variant] : this.sprites[spriteName];
        if (sprite) {
            sprite.draw(ctx, x, y, w, h);
        } else {
            this.defaultSprite.draw(ctx, x, y, w, h);
        }
    }

    addAnimation(name: string, sprites: Sprite[]): void {
        this.animations[name] = new AnimatedSprite(sprites);
        console.log("anim", name, this.animations[name].sprites);
    }

    getAnimation(name: string): AnimatedSprite {
        return this.animations[name];
    }

    getSprite(name: string): Sprite {
        return this.sprites[name];
    }

    // drawAnimation(ctx, animName, x, y, w, h) {
    //     console.log("draw animation", animName);
    //     var anim = this.animations[animName];
    //     if (anim)
    //         anim.draw(ctx, x, y, w, h);
    // }
}

export class Sprite {
    sheet: SpriteSheet;
    x: number;
    y: number;
    w: number;
    h: number;
    constructor(sheet: SpriteSheet, x: number, y: number, w: number, h: number) {
        this.sheet = sheet;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw(ctx:CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
        ctx.drawImage(this.sheet.img, this.x, this.y, this.w, this.h, x, y, w, h);
    }
}

export class AnimatedSprite {
    sprites: Sprite[];
    constructor(sprites: Sprite[]) {
        this.sprites = sprites;
    }

    getFrame(iFrame: number): Sprite {
        return this.sprites[iFrame];
    }

    get frameCount(): number {
        return this.sprites.length;
    }

    // draw(ctx, x, y, w, h) {
    //     this.sprite.draw(ctx, x, y, w, h);
    // }
}
