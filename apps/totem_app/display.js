import {ImageLoader} from "./components/file.js";
import {TorchPointer} from "./components/pointer.js";

let pointer = new TorchPointer("bubble");
let imgLoader = new ImageLoader();

pointer.o

export const totem_app = new p5((sketch) => {
    sketch.name = "totem_app";
    sketch.activated = false;

    sketch.preload = () => {
        // Load assets (images, sounds, fonts, etc.)
        
    };

    function updateHandData(hand_pose) {
        // pointer.updateHandData(hand_pose);
        if (hand_pose && hand_pose.length > 0) {
            let pos = hand_pose.map(element => {
                return [-0.3 + element[0]*sketch.width/0.6, -0.1 + element[1]*sketch.height/0.6]
            });
            pointer.updateHandData(pos, ["INDEX", 1.0]);
        }
    }

    sketch.set = (width, height, socket) => {
        sketch.selfCanvas = sketch
            .createCanvas(width, height)//, sketch.WEBGL) if you want to make 3d using p5 WEBGL
            .position(0, 0);
        sketch.activated = true;
        // Set up your app here
        socket.on("totem_hand_pose", (data) => updateHandData(data.hands_landmarks[0])); //replace null by a data update function
        socket.emit("totem_get_images"); //replace null by a data update function
        socket.on("totem_images", (data) => imgLoader.preload(data)); //replace null by a data update function
    };

    sketch.resume = () => {};
    sketch.pause = () => {};
    sketch.update = () => {
        // Update your app here
        pointer.update();
        if (pointer.pressed) {
            // pointer.clicked = false;
            imgLoader.onPressed(pointer.x, pointer.y);
        }
        if (pointer.released) {
            imgLoader.onReleased(pointer.x, pointer.y);
        }
        imgLoader.update(sketch, pointer.y);
        console.log(imgLoader.getSelected());
    };



    sketch.windowResized = () => sketch.resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        //Draw here
        imgLoader.display(sketch);
        pointer.display(sketch);
    };
});
