//% block=Scroller
//% color="#ff85a7"
//% icon="\uf0b2"
namespace scroller {
    export enum CameraScrollMode {
        //% block="only horizontally"
        //% block.loc.de="nur horizontal"
        OnlyHorizontal,
        //% block="only vertically"
        //% block.loc.de="nur vertikal"
        OnlyVertical,
        //% block="both directions"
        //% block.loc.de="beide Richtungen"
        BothDirections
    }

    export enum BackgroundLayer {
        //% block="layer 0 (bottom)"
        //% block.loc.de="Ebene 0 (unten)"
        Layer0,
        //% block="layer 1"
        //% block.loc.de="Ebene 1"
        Layer1,
        //% block="layer 2"
        //% block.loc.de="Ebene 2"
        Layer2,
        //% block="layer 3"
        //% block.loc.de="Ebene 3"
        Layer3,
        //% block="layer 4 (top)"
        //% block.loc.de="Ebene 4 (oben)"
        Layer4
    }

    class LayerState {
        public lastCameraX: number;
        public lastCameraY: number;
        public renderable: scene.Renderable;

        protected layers: ScrollerState[];

        constructor() {
            this.updateCameraPosition();
            this.layers = [new ScrollerState(BackgroundLayer.Layer0, -1000)];

            game.currentScene().eventContext.registerFrameHandler(scene.PRE_RENDER_UPDATE_PRIORITY + 1, () => {
                this.update();
            });
        }

        getLayer(layer: number) {
            layer |= 0;

            for (const layerState of this.layers) {
                if (layerState.layer === layer) {
                    return layerState;
                }
            }

            const newLayer = new ScrollerState(layer, -1000 + layer)
            this.layers.push(newLayer);
            return newLayer;
        }

        update() {
            for (const layer of this.layers) {
                layer.update(this.lastCameraX, this.lastCameraY)
            }

            this.updateCameraPosition();
        }

        updateCameraPosition() {
            this.lastCameraX = game.currentScene().camera.offsetX;
            this.lastCameraY = game.currentScene().camera.offsetY;
        }

        setLayerZ(layer: number, z: number) {
            const scrollState = this.getLayer(layer);
            scrollState.renderable.z = z;
        }
    }

    let stateStack: LayerState[];
    class ScrollerState {
        public xOffset: number;
        public yOffset: number;
        public currentXSpeed: number;
        public currentYSpeed: number;
        public cameraScrolling: boolean;
        public cameraScrollMode: CameraScrollMode;
        public cameraXMultiplier: number;
        public cameraYMultiplier: number;
        public image: Image;
        public renderable: scene.Renderable;

        constructor(public layer: number, z: number) {
            this.xOffset = 0;
            this.yOffset = 0;
            this.currentXSpeed = 0;
            this.currentYSpeed = 0;
            this.cameraScrolling = false;
            this.cameraScrollMode = CameraScrollMode.OnlyHorizontal;
            this.cameraXMultiplier = 1;
            this.cameraYMultiplier = 1;
            this.renderable = scene.createRenderable(z, target => this.draw(target));
        }

        update(lastCameraX: number, lastCameraY: number) {
            const bg = this.image || scene.backgroundImage();

            if (this.cameraScrolling) {
                if (this.cameraScrollMode === CameraScrollMode.OnlyHorizontal || this.cameraScrollMode === CameraScrollMode.BothDirections) {
                    this.xOffset -= (game.currentScene().camera.offsetX - lastCameraX) * this.cameraXMultiplier;
                }

                if (this.cameraScrollMode === CameraScrollMode.OnlyVertical || this.cameraScrollMode === CameraScrollMode.BothDirections) {
                    this.yOffset -= (game.currentScene().camera.offsetY - lastCameraY) * this.cameraYMultiplier;
                }
            }
            else {
                this.xOffset += this.currentXSpeed * game.currentScene().eventContext.deltaTime;
                this.yOffset += this.currentYSpeed * game.currentScene().eventContext.deltaTime;
            }

            while (this.xOffset >= bg.width) this.xOffset -= bg.width;
            while (this.xOffset < 0) this.xOffset += bg.width;
            while (this.yOffset >= bg.height) this.yOffset -= bg.height;
            while (this.yOffset < 0) this.yOffset += bg.height;
        }

        draw(target: Image) {
            const bg = this.image || scene.backgroundImage();

            if (this.xOffset) {
                if (this.yOffset) {
                    target.drawTransparentImage(bg, (this.xOffset | 0) - bg.width, (this.yOffset | 0) - bg.height);
                    target.drawTransparentImage(bg, (this.xOffset | 0) - bg.width, (this.yOffset | 0));
                    target.drawTransparentImage(bg, (this.xOffset | 0), (this.yOffset | 0) - bg.height);
                    target.drawTransparentImage(bg, (this.xOffset | 0), (this.yOffset | 0));
                }
                else {
                    target.drawTransparentImage(bg, (this.xOffset | 0) - bg.width, 0);
                    target.drawTransparentImage(bg, (this.xOffset | 0), 0);
                }
            }
            else if (this.yOffset) {
                target.drawTransparentImage(bg, 0, (this.yOffset | 0) - bg.height);
                target.drawTransparentImage(bg, 0, (this.yOffset | 0));
            }
            else {
                target.drawTransparentImage(bg, 0, 0)
            }
        }
    }

    function state() {
        init();
        return stateStack[stateStack.length - 1];
    }

    function init() {
        if (!stateStack) {
            stateStack = [new LayerState()];

            game.addScenePushHandler(function (oldScene: scene.Scene) {
                stateStack.push(new LayerState());
            });

            game.addScenePopHandler(function (oldScene: scene.Scene) {
                stateStack.pop()
                if (stateStack.length === 0) {
                    stateStack.push(new LayerState());
                }
            });
        }
    }

    /**
     * Make the current background image scroll along with the camera.
     *
     *
     * @param mode Controls the directions in which the camera may scroll
     */
    //% block="scroll background with camera $mode || for $layer"
    //% block.loc.de="scrolle Hintergrund mit Kamera $mode || für $layer"
    //% blockId=scroller_scrollBackgroundWithCamera
    //% layer.shadow=scroller_backgroundLayer
    //% group="Scrolling"
    //% group.loc.de="Scrolling"
    //% weight=40
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/scroll-background-with-camera
    export function scrollBackgroundWithCamera(mode: CameraScrollMode, layer = 0) {
        const currentState = state().getLayer(layer);
        currentState.cameraScrolling = true;
        currentState.cameraScrollMode = mode;
    }

    /**
     * Make the current background image scroll at the given speeds
     *
     *
     * @param vx The speed to scroll horizontally in pixels per second
     * @param vy The speed to scroll vertically in pixels per second
     */
    //% block="scroll background with vx $vx vy $vy || for $layer"
    //% block.loc.de="scrolle Hintergrund mit vx $vx vy $vy || für $layer"
    //% vx.defl=-50
    //% vy.defl=-50
    //% layer.shadow=scroller_backgroundLayer
    //% group="Scrolling"
    //% group.loc.de="Scrolling"
    //% weight=20
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/scroll-background-with-speed
    export function scrollBackgroundWithSpeed(vx: number, vy: number, layer = 0) {
        const currentState = state().getLayer(layer);
        currentState.currentXSpeed = vx;
        currentState.currentYSpeed = vy;
        currentState.cameraScrolling = false;
    }

    /**
     * Sets multipliers for the scroll directions that can be used to make scrolling
     * faster or slower in the given direction. 1 means scroll exactly with the camera
     * for both directions.
     *
     *
     * @param xMultiplier A multiplier to apply to the scrolling in the horizontal direction
     * @param yMultiplier A multiplier to apply to the scrolling in the vertical direction
     */
    //% block="set background camera scroll multipliers to x $xMultiplier y $yMultiplier || for $layer"
    //% block.loc.de="setze Hintergrund Kamera Scroll-Multiplikatoren auf x $xMultiplier y $yMultiplier || für $layer"
    //% blockId=scroller_setCameraScrollingMultipliers
    //% xMultiplier.defl=1
    //% yMultiplier.defl=1
    //% layer.shadow=scroller_backgroundLayer
    //% group="Scrolling"
    //% group.loc.de="Scrolling"
    //% weight=0
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/set-camera-scrolling-multipliers
    export function setCameraScrollingMultipliers(xMultiplier = 1, yMultiplier = 1, layer = 0) {
        const currentState = state().getLayer(layer);
        currentState.cameraScrolling = true;
        currentState.cameraXMultiplier = xMultiplier;
        currentState.cameraYMultiplier = yMultiplier;
    }

    /**
     * Manually set the scroll offset of the background
     *
     *
     * @param x The x offset of the background in pixels
     * @param y The y offset of the background in pixels
     */
    //% block="set background offset to x $x y $y || for $layer"
    //% block.loc.de="setze Hintergrund-Versatz auf x $x y $y || für $layer"
    //% blockId=scroller_setBackgroundScrollOffset
    //% x.defl=0
    //% y.defl=0
    //% layer.shadow=scroller_backgroundLayer
    //% group="Position"
    //% group.loc.de="Position"
    //% weight=40
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/set-background-offset
    export function setBackgroundScrollOffset(x: number, y: number, layer = 0) {
        const currentState = state().getLayer(layer);
        currentState.xOffset = x;
        currentState.yOffset = y;
    }

    /**
     * Returns the current x offset of the scrolled background
     */
    //% block="background offset x || for $layer"
    //% block.loc.de="Hintergrund-Versatz x || für $layer"
    //% blockId=scroller_getBackgroundXOffset
    //% layer.shadow=scroller_backgroundLayer
    //% group="Position"
    //% group.loc.de="Position"
    //% weight=20
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/background-x-offset
    export function getBackgroundXOffset(layer = 0) {
        return state().getLayer(layer).xOffset;
    }

    /**
     * Returns the current y offset of the scrolled background
     */
    //% block="background offset y || for $layer"
    //% block.loc.de="Hintergrund-Versatz y || für $layer"
    //% blockId=scroller_getBackgroundYOffset
    //% layer.shadow=scroller_backgroundLayer
    //% group="Position"
    //% group.loc.de="Position"
    //% weight=0
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/background-y-offset
    export function getBackgroundYOffset(layer = 0) {
        return state().getLayer(layer).yOffset;
    }

    /**
     * Sets the image for a specific layer in the parallax stack. Layer 0 is the
     * default (and the furthest from the camera).
     */
    //% block="set image for $layer to $image"
    //% block.loc.de="setze Bild für $layer auf $image"
    //% blockId=scroller_setLayerImage
    //% image.shadow=background_image_picker
    //% layer.shadow=scroller_backgroundLayer
    //% group="Parallax"
    //% group.loc.de="Parallax"
    //% weight=10
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/set-layer-image
    export function setLayerImage(layer: number, image: Image) {
        state().getLayer(layer).image = image;
    }

    /**
     * Sets the z-index for a layer in the parallax stack. The default
     * z-indices range from -1000 (layer 0) to -996 (layer 4)
     */
    //% block="set z-index for $layer to $z"
    //% block.loc.de="setze z-Index für $layer auf $z"
    //% blockId=scroller_setLayerZIndex
    //% layer.shadow=scroller_backgroundLayer
    //% z.defl=-1000
    //% group="Parallax"
    //% group.loc.de="Parallax"
    //% weight=5
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/set-layer-z-index
    export function setLayerZIndex(layer: number, z: number) {
        state().setLayerZ(layer, z);
    }

    /**
     * A layer in the parallax stack
     */
    //% shim=TD_ID
    //% block="$layer"
    //% blockId=scroller_backgroundLayer
    //% group="Parallax"
    //% group.loc.de="Parallax"
    //% weight=0
    //% blockGap=8
    export function _backgroundLayer(layer: BackgroundLayer): number {
        return layer;
    }
}