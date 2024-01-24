import {
    TorchPointer
} from "./components/pointer.js";

import {
    Button
} from "./components/button.js";

import {
    Toggle
} from "./components/toggle.js";

import {
    ColorPicker
} from "./components/colorPicker.js";

import {
    paintingArea
} from "./components/painting.js";

import {
    imageHolder
} from "./components/imageholder.js";

import {
    TextInput
} from "./components/textInput.js";

export function project2DPoint(point, matrix) {
    let [x, y] = point;
    let z = 1;
    let out = [];
    out[0] = x * matrix[0][0] + y * matrix[0][1] + z * matrix[0][2];
    out[1] = x * matrix[1][0] + y * matrix[1][1] + z * matrix[1][2];

    return out;
}


export function projectP5Context(context, matrix) {
    context.applyMatrix(matrix[0][0], matrix[1][0], matrix[0][1], matrix[1][1], matrix[0][2], matrix[1][2]);
    return context;
}


export const sdxl_app = new p5((sketch) => {
    sketch.name = "sdxl_app";
    sketch.z_index = 20;
    sketch.activated = false;
    let hands_position = [];
    let hands_handedness = [];
    let hands_sign = [];
    let pointers = [];
    
    sketch.intervalId;
    sketch.defaultPointerStyle = "bubble";
    sketch.isDrawing = false;
    sketch.isErasing = false;
    sketch.mode = 1;
    sketch.currentCornerIndex = 3;
    sketch.processing = false;
    let drawToggle;
    let eraseToggle;
    let clearButton;
    let savButton;
    let textinput;
    let colorPicker;
    let imageholder;

    let corners = [[sketch.width/4, sketch.height/4], [sketch.width*3/4, sketch.height/4], [sketch.width*3/4, sketch.height*3/4], [sketch.width/4, sketch.height*3/4]];
    
    sketch.set = (width, height, socket) => {
        corners = [[10*sketch.width/4 - 200, 10*sketch.height/4+800], [10*sketch.width*3/4- 200, 10*sketch.height/4+800], [10*sketch.width*3/4- 200, 10*sketch.height*3/4+800], [10*sketch.width/4- 200, 10*sketch.height*3/4+800]];
        sketch.socket = socket;
        sketch.selfCanvas = sketch
            .createCanvas(width, height)
            .position(0, 0)
            .style("z-index", sketch.z_index);

        socket.on(sketch.name, (payload) => {
            let data = payload["data"];
            let type = payload["type"];
            if (type == "hand_pose") {
                if (data == undefined || data.length == 0) return;
                hands_position = data["hands_landmarks"];
                hands_handedness = data["hands_handedness"];
                hands_sign = data["hands_sign"];

                // Update pointers
                if (pointers.length > hands_position.length) {
                    pointers = pointers.slice(0, hands_position.length);
                }

                pointers.forEach((pointer, index) => {
                    let hand_pose = hands_position[index].map((point) => {
                        return[-0.3 + point[0] * width/0.7, -0.3 + point[1] * height/0.7];
                    });

                    pointer.updateHandData(hand_pose, hands_sign[index]);
                });


                if (pointers.length < hands_position.length) {
                    for (let i = pointers.length; i < hands_position.length; i++) {
                        let pointer = new TorchPointer(sketch.defaultPointerStyle);
                        // console.log("here");
                        let hand_pose = hands_position[i].map((point) => {
                            return  [-0.3 + point[0] * width/0.7, -0.3 + point[1] * height/0.7];
                        });
                        pointer.updateHandData(hand_pose, hands_sign[i]);
                        pointers.push(pointer);
                    }
                }
            } else if (type == "calibration") {
                console.log(data);
                if (data == undefined || data == null) return;
                console.log(data);
            }
            
        });
        if (sketch.intervalId) clearInterval(sketch.intervalId);
        // every 200ms, send the current state of the painting area
        sketch.intervalId = setInterval(() => {
            let img = paintingArea.getImg();
            let prompt = textinput.text;
            sketch.socket.emit("sdxl_paint", {
                "img": img,
                "prompt": prompt
            });
        }, 500);

        sketch.socket.on("sdxl_api_response", (data) => {
            imageholder.updateImg(data);
        });
        
        const group_width = 300;
        const group_height = 500;
        colorPicker = new ColorPicker(width/2 - group_width/5 + 350, height/2 + group_height/2 + 100, group_width, group_height);

        drawToggle = new Toggle(width/2 - group_width/2+ 350, height/2 + group_height/3 + group_height*4/5+ 100, group_width/2, group_height/8, "Draw", sketch.color("hsl(200, 50%, 50%)"));
        drawToggle.setOnClick(() => {
            sketch.isDrawing = drawToggle.active;
            if (sketch.isDrawing) {
                eraseToggle.active = false;
                sketch.isErasing = false;
            }
        });

        eraseToggle = new Toggle(width/2 +20+ 350, height/2 + group_height/3 + group_height*4/5+ 100, group_width/2, group_height/8, "Erase", sketch.color("hsl(330, 50%, 50%)"));
        eraseToggle.setOnClick(() => {
            sketch.isErasing = eraseToggle.active;
            if (sketch.isErasing) {
                drawToggle.active = false;
                sketch.isDrawing = false;
            }
        });

        clearButton = new Button(width/2 - group_width/5+ 350, height/2 + group_height*1.3+ 100, group_width, group_height/8, "Clear", sketch.color("hsl(0, 50%, 50%)"));
        clearButton.setOnClick(() => {
            paintingArea.clear();
            paintingArea.set(corners);
        });

        savButton = new Button(width/2 - group_width/5 -150, height/2 + group_height/2 - 100, group_width, group_height/8, "Save", sketch.color("rgb(0, 128, 0)"));

        imageholder = new imageHolder(width/2 - 250, height/4 -90, 500, 500, sketch);

        savButton.setOnClick(() => {
            let inputimg = paintingArea.getImg();
            let ouputimg = imageholder.getImg();
            console.log("input", inputimg);
            console.log("output", ouputimg);
            sketch.socket.emit("sdxl_save", {
                "input": inputimg,
                "output": ouputimg
            });
        });
        
        textinput = new TextInput(width/2 , height/4 -200, group_width*2, group_height/8, "a drawing of a face");
        colorPicker.enable();
        sketch.enableElements();

        paintingArea.set(corners);
        sketch.activated = true;
    };

    sketch.resume = () => {paintingArea.selfCanvas.show();};
    sketch.pause = () => {paintingArea.selfCanvas.hide();};

    sketch.enableElements = () => {
        drawToggle.enabled = true;
        eraseToggle.enabled = true;
        clearButton.enabled = true;
        savButton.enabled = true;
        colorPicker.enable();
    }

    sketch.disableElements = () => {
        drawToggle.enabled = false;
        eraseToggle.enabled = false;
        clearButton.enabled = false;
        savButton.enabled = false;
        colorPicker.disable();
    }

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
        corners = [[10*sketch.width/4, 10*sketch.height/4], [10*sketch.width*3/4, 10*sketch.height/4], [10*sketch.width*3/4, 10*sketch.height*3/4], [10*sketch.width/4, 10*sketch.height*3/4]];
    };


    sketch.update = () => {
        pointers.forEach((pointer) => {
            pointer.drawing = sketch.isDrawing;
            pointer.pointerSize = colorPicker.sizeSlider.sizeValue;
            pointer.pointerColor = `hsl(${colorPicker.hueSlider.hueValue}, ${colorPicker.saturationSlider.saturationValue}%, ${colorPicker.luminositySlider.luminosityValue}%)`
            pointer.update();
            drawToggle.update(pointer);
            eraseToggle.update(pointer);
            colorPicker.update(pointer);
            clearButton.update(pointer);
            savButton.update(pointer);
            textinput.update(pointer);

            if (paintingArea != undefined) paintingArea.update(pointer, sketch.isErasing);
        });
    };

    sketch.show = () => {
        sketch.clear();
        if (sketch.processing) {
            sketch.background(0);
            return;
        }
        eraseToggle.display(sketch);
        drawToggle.display(sketch);
        colorPicker.display(sketch);
        savButton.display(sketch);
        clearButton.display(sketch);
        imageholder.display(sketch);
        textinput.display(sketch);
        pointers.forEach((pointer) => {
            pointer.display(sketch);
        });
    };


});
