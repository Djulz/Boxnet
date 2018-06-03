
import * as Models from "./../../shared/Models";
import { AnimatedSprite, Sprite } from "./SpriteSheet";
import { DrawableMap } from "./DrawableMap";

const drawPadding = .1;
const playerColors = ["#00FF00", "#FF0000", "#FFFF00"];

export class DrawableUnit {
    public unitModel:Models.UnitModel;
    public x:number;
    y:number;
    hp:number;
    target:DrawableUnit;
    animationData:AnimationData;
    sprite:Sprite;
    id:number;
    map:DrawableMap;

    constructor(x:number, y:number, unitModel:Models.UnitModel) {
        this.unitModel = unitModel;
        this.x = x;
        this.y = y;
        this.hp = unitModel.hp;
        this.target = null;
        this.animationData = null;
        this.sprite = null;
        //this.img = this.map.getImage(this.unitModel.type);
    }

    initAnimation(animatedSprite:AnimatedSprite, anim:string) {
        this.animationData = new AnimationData(animatedSprite);
        //this.animationData.set
    }

    initSprite(sprite:Sprite) {
        this.sprite = sprite;
    }

    update(ms:number) {
        if (this.animationData)
            this.animationData.update(ms);
    }

    draw(ctx:CanvasRenderingContext2D, tileSize:number) {

        if (this.animationData) {
            this.animationData.draw(ctx, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        } else {
            this.sprite.draw(ctx, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        }
        // ctx.fillStyle = this.getColor();
        // //console.log("drawing ", this, ctx.fillStyle, tileSize);
        // var padding = (tileSize * drawPadding);
        // if (this.unitModel.type == "core")
        //     ctx.fillRect(this.x * tileSize + padding - tileSize, this.y * tileSize + padding - tileSize,
        //         tileSize * 3 - 2 * padding, tileSize * 3 - 2 * padding);
        // else
        //     ctx.fillRect(this.x * tileSize + padding, this.y * tileSize + padding, tileSize - 2 * padding, tileSize - 2 * padding);

        //Target
        if (this.target != null) {
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            ctx.moveTo((this.x + .5) * tileSize, (this.y + .5) * tileSize);
            ctx.lineTo((this.target.x + .5) * tileSize, (this.target.y + .5) * tileSize);
            ctx.stroke();
        }

        //hp
        //ctx.font = "10px Verdana";
        //ctx.fillStyle = "#000000";
        //ctx.fillText(this.hp + "", this.x * tileSize, this.y * tileSize);

        //hp
        if (this.hp < this.unitModel.hp) {
            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 1;
            ctx.beginPath();
            const hpPerc = this.hp / this.unitModel.hp;
            const inverseHalf = (1 - hpPerc) / 2;
            ctx.moveTo((this.x + inverseHalf) * tileSize + 1, this.y * tileSize + 1);
            ctx.lineTo((this.x + 1 - inverseHalf) * tileSize - 1, this.y * tileSize + 1);
            ctx.stroke();
        }

    }

    getColor() {
        switch (this.unitModel.type) {
            case "core":
            //return playerColors[this.owner];
            case "grower":
                return playerColors[this.unitModel.owner];
            //return "#ccc";

            default:
                return "#000000";
        }
    }
}

class AnimationData {
    currentFrame:number;
    private pfps:number;
    private pframeTime:number;
    frameTimePassed:number;
    animatedSprite:AnimatedSprite;
    startFrame:number;
    endFrame:number;
    pingPong:boolean;

    constructor(animatedSprite:AnimatedSprite) {
        this.currentFrame = 0;
        this.fps = 2;
        this.frameTimePassed = 0;
        this.animatedSprite = animatedSprite;
        this.startFrame = 0;
        this.endFrame = animatedSprite.frameCount - 1;
        this.pingPong = false;
    }

    set fps(i:number) {
        this.pfps = i;
        this.pframeTime = 1000.0 / i;
    }

    setFrame(i:number) {
        this.currentFrame = i % this.animatedSprite.frameCount;
    }

    nextFrame() {
        this.setFrame(this.currentFrame + 1);
    }

    update(ms:number) {
        this.frameTimePassed += ms;
        while (this.frameTimePassed >= this.pframeTime) {
            this.frameTimePassed -= this.pframeTime;
            this.nextFrame();
        }
    }

    draw(ctx:CanvasRenderingContext2D, x:number, y:number, w:number, h:number) {
        const sprite = this.animatedSprite.getFrame(this.currentFrame);
        sprite.draw(ctx, x, y, w, h);
    }

}
