// import {className} from "./components/file.js";

export const template_app = new p5((sketch) => {
    sketch.name = "<template_app>";
    sketch.activated = false;

    sketch.preload = () => {
        // Load assets (images, sounds, fonts, etc.)
    };

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)//, sketch.WEBGL) if you want to make 3d using p5 WEBGL
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
        //Draw here
    };
});
