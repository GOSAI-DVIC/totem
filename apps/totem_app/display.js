import {ImageLoader} from "./components/file.js";
import {TorchPointer} from "./components/pointer.js";

let pointer = new TorchPointer("bubble");
let imgLoader = new ImageLoader();
let currentSelected = null;

export const totem_app = new p5((sketch) => {
    sketch.name = "totem_app";
    sketch.activated = false;
    sketch.socket = null;

    sketch.preload = () => {
        
    };

    function updateHandData(hand_pose) {
        if (hand_pose && hand_pose.length > 0) {
            let pos = hand_pose.map(element => {
                return [(-0.3 + element[0]*sketch.width)/0.7, (-0.3 + element[1]*sketch.height)/0.7]
            });
            pointer.updateHandData(pos, ["INDEX", 1.0]);
        }
    }


    let t = Date.now();
    let receivedImage;
    let receivedImage2;
    function handle_frame(data) {
        let blob = new Blob([data], { type: 'image/png' });
        let url = URL.createObjectURL(blob);
    
        loadImage(url, (img) => {
            receivedImage = img;
            URL.revokeObjectURL(url);
        }, (event) => {
            console.error("Error loading image:", event);
        });
    }
    function handle_frame2(data) {
        let blob = new Blob([data], { type: 'image/png' });
        let url = URL.createObjectURL(blob);
    
        loadImage(url, (img) => {
            receivedImage2 = img;
            URL.revokeObjectURL(url);
        }, (event) => {
            console.error("Error loading image:", event);
        });
    }

    sketch.set = (width, height, socket) => {
        sketch.socket = socket;
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0);
        sketch.activated = true;
        // Set up your app here
        socket.on("totem_hand_pose", (data) => updateHandData(data.hands_landmarks[0]));
        socket.emit("totem_get_images"); 
        socket.on("totem_images", (data) => imgLoader.preload(data)); 
        socket.on("totem_out_image", (data) => handle_frame(data));
        socket.on("totem_in_image", (data) => handle_frame2(data));
    };

    sketch.resume = () => {
        sketch.socket.emit("totem_get_images"); 
    };
    sketch.pause = () => {};
    sketch.update = () => {
        // Update your app here
        pointer.update();
        if (pointer.pressed) {
            imgLoader.onPressed(pointer.x, pointer.y);
        }
        if (pointer.released) {
            imgLoader.onReleased(pointer.x, pointer.y);
        }
        imgLoader.update(sketch, pointer.y);
        const selected = imgLoader.getSelected();
        if (currentSelected != selected && sketch.socket) {
            currentSelected = selected;
            sketch.socket.emit("totem_set_image", currentSelected);
            console.log(currentSelected);
        }
    };



    sketch.windowResized = () => sketch.resizeCanvas(windowWidth, windowHeight);

    sketch.show = () => {
        sketch.clear();
        //Draw here
        imgLoader.display(sketch);
        if (receivedImage) {
            sketch.image(receivedImage, sketch.width/2 - 256, sketch.height/4 -256, 512, 512);
        }
        if (receivedImage2) {
            sketch.image(receivedImage2, sketch.width/2 - 256, sketch.height/4 +512, 512, 512);
        }
        pointer.display(sketch);
    };
});
