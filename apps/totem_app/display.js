// import {className} from "./components/file.js";

export const totem_app = new p5((sketch) => {
    sketch.name = "totem_app";
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
        socket.on("totem_hand_pose", (data) => null); //replace null by a data update function
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
