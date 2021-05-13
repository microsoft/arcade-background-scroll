
//% block=Scroller
//% color="#ff85a7"
//% icon="\uf047"
namespace scroller {
    export enum CameraScrollMode {
        //% block="only horizontally"
        OnlyHorizontal,
        //% block="only vertically"
        OnlyVertical,
        //% block="both directions"
        BothDirections
    }

    let stateStack: ScrollerState[];
    class ScrollerState {
        public xOffset: number;
        public yOffset: number;
        public currentXSpeed: number;
        public currentYSpeed: number;
        public renderable: scene.Renderable
        public cameraScrolling: boolean;
        public cameraScrollMode: CameraScrollMode;
        public cameraXMultiplier: number;
        public cameraYMultiplier: number;
        public lastCameraX: number;
        public lastCameraY: number;

        constructor() {
            this.xOffset = 0;
            this.yOffset = 0;
            this.currentXSpeed = 0;
            this.currentYSpeed = 0;
            this.cameraScrolling = false;
            this.cameraScrollMode = CameraScrollMode.OnlyHorizontal;
            this.cameraXMultiplier = 1;
            this.cameraYMultiplier = 1;
        }

        init() {
            let bg: Image;
            let currentState: ScrollerState;

            this.lastCameraX = game.currentScene().camera.offsetX;
            this.lastCameraY = game.currentScene().camera.offsetY;

            game.currentScene().eventContext.registerFrameHandler(scene.PRE_RENDER_UPDATE_PRIORITY + 1, () => {
                bg = scene.backgroundImage();
                currentState = state();

                if (this.cameraScrolling) {
                    if (this.cameraScrollMode === CameraScrollMode.OnlyHorizontal || this.cameraScrollMode === CameraScrollMode.BothDirections) {
                        currentState.xOffset -= (game.currentScene().camera.offsetX - this.lastCameraX) * this.cameraXMultiplier;
                    }

                    if (this.cameraScrollMode === CameraScrollMode.OnlyVertical || this.cameraScrollMode === CameraScrollMode.BothDirections) {
                        currentState.yOffset -= (game.currentScene().camera.offsetY - this.lastCameraY) * this.cameraYMultiplier;
                    }
                }
                else {
                    currentState.xOffset += currentState.currentXSpeed * game.currentScene().eventContext.deltaTime;
                    currentState.yOffset += currentState.currentYSpeed * game.currentScene().eventContext.deltaTime;
                }

                while (currentState.xOffset >= bg.width) currentState.xOffset -= bg.width;
                while (currentState.xOffset < 0) currentState.xOffset += bg.width;
                while (currentState.yOffset >= bg.height) currentState.yOffset -= bg.height;
                while (currentState.yOffset < 0) currentState.yOffset += bg.height;

                this.lastCameraX = game.currentScene().camera.offsetX;
                this.lastCameraY = game.currentScene().camera.offsetY;
            })

            this.renderable = scene.createRenderable(-1000, function(target: Image, camera: scene.Camera) {
                if (currentState.xOffset) {
                    if (currentState.yOffset) {
                        target.drawTransparentImage(bg, (currentState.xOffset | 0) - bg.width, (currentState.yOffset | 0) - bg.height);
                        target.drawTransparentImage(bg, (currentState.xOffset | 0) - bg.width, (currentState.yOffset | 0));
                        target.drawTransparentImage(bg, (currentState.xOffset | 0), (currentState.yOffset | 0) - bg.height);
                        target.drawTransparentImage(bg, (currentState.xOffset | 0), (currentState.yOffset | 0));
                    }
                    else {
                        target.drawTransparentImage(bg, (currentState.xOffset | 0) - bg.width, 0);
                        target.drawTransparentImage(bg, (currentState.xOffset | 0), 0);
                    }
                }
                else if (currentState.yOffset) {
                        target.drawTransparentImage(bg, 0, (currentState.yOffset | 0) - bg.height);
                        target.drawTransparentImage(bg, 0, (currentState.yOffset | 0));
                }
            });
        }
    }

    function state() {
        init();
        return stateStack[stateStack.length - 1];
    }

    function init() {
        if (!stateStack) {
            stateStack = [new ScrollerState()];

            game.addScenePushHandler(function(oldScene: scene.Scene) {
                stateStack.push(new ScrollerState());
                state().init();
            });

            game.addScenePopHandler(function(oldScene: scene.Scene) {
                stateStack.pop()
                if (stateStack.length === 0) {
                    stateStack.push(new ScrollerState());
                    state().init();
                }
            });

            state().init();
        }
    }

    /**
     * Make the current background image scroll along with the camera.
     *
     *
     * @param mode Controls the directions in which the camera may scroll
     */
    //% block="scroll background with camera $mode"
    //% blockId=scroller_scrollBackgroundWithCamera
    //% group="Scrolling"
    //% weight=40
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/scroll-background-with-camera
    export function scrollBackgroundWithCamera(mode: CameraScrollMode) {
        const currentState = state();
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
    //% block="scroll background with vx $vx vy $vy"
    //% blockId=scroller_scrollBackgroundWithSpeed
    //% vx.defl=-50
    //% vy.defl=-50
    //% group="Scrolling"
    //% weight=20
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/scroll-background-with-speed
    export function scrollBackgroundWithSpeed(vx: number, vy: number) {
        const currentState = state();
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
    //% block="set background camera scroll multipliers to x $xMultiplier y $yMultiplier"
    //% blockId=scroller_setCameraScrollingMultipliers
    //% xMultiplier.defl=1
    //% yMultiplier.defl=1
    //% group="Scrolling"
    //% weight=0
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/set-camera-scrolling-multipliers
    export function setCameraScrollingMultipliers(xMultiplier = 1, yMultiplier = 1) {
        const currentState = state();
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
    //% block="set background offset to x $x y $y"
    //% blockId=scroller_setBackgroundScrollOffset
    //% x.defl=0
    //% y.defl=0
    //% group="Position"
    //% weight=40
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/set-background-offset
    export function setBackgroundScrollOffset(x: number, y: number) {
        const currentState = state();
        currentState.xOffset = x;
        currentState.yOffset = y;
    }

    /**
     * Returns the current x offset of the scrolled background
     */
    //% block="background offset x"
    //% blockId=scroller_getBackgroundXOffset
    //% group="Position"
    //% weight=20
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/background-x-offset
    export function getBackgroundXOffset() {
        return state().xOffset;
    }

    /**
     * Returns the current y offset of the scrolled background
     */
    //% block="background offset y"
    //% blockId=scroller_getBackgroundYOffset
    //% group="Position"
    //% weight=0
    //% blockGap=8
    //% help=github:arcade-background-scroll/docs/background-y-offset
    export function getBackgroundYOffset() {
        return state().yOffset;
    }
}