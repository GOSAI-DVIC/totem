import {
    __state__Show, __state__Reset
} from "./states/template_state.js";

let state = "__initialState__";

export const template_sm_app = new p5((sketch) => {
    sketch.name = "<template_sm_app>";
    sketch.activated = false;

    sketch.preload = () => {
        // Load assets (images, sounds, fonts, etc.)
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height, sketch.WEBGL)
            .position(0, 0);
        sketch.activated = true;
        // Set up your app here
        socket.on("<event_data_name>", (data) => null); //replace null by a data update function
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {};

    sketch.windowResized = () => resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        
        // state machine
        switch (state) {
            case "__state__":
                state = __state__Show(sketch);
                break;
            case "__anotherState1__":
                // state = __anotherState1__Show(sketch);
                break;
            case "__anotherState2__":
                // state = __anotherState2__Show(sketch);
                break;
            default:
                break;
        }
    };
});
