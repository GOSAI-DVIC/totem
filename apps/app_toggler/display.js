import {
    TorchPointer
} from "./components/pointer.js";


import {
    Toggle
} from "./components/toggle.js";



export const app_toggler = new p5((sketch) => {
    sketch.name = "app_toggler";
    sketch.z_index = 20;
    sketch.activated = false;
    let hands_position = [];
    let hands_handedness = [];
    let hands_sign = [];
    let pointers = [];
    let app_toggle;
    let available_apps = ["sdxl_app", "totem_app"]
    let current_app = 0;
    
    sketch.defaultPointerStyle = "bubble";

    sketch.set = (width, height, socket) => {
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
                        let hand_pose = hands_position[i].map((point) => {
                            return  [-0.3 + point[0] * width/0.7, -0.3 + point[1] * height/0.7];
                        });
                        pointer.updateHandData(hand_pose, hands_sign[i]);
                        pointers.push(pointer);
                    }
                }
            }
            
        });

        app_toggle = new Toggle(width/2 , 80 , 600, 100, "switch app", sketch.color("hsl(360, 100%, 100%)"));
        app_toggle.setOnClick(() => {
            const last_app_name = available_apps[current_app];
            current_app = (current_app + 1) % available_apps.length;
            const new_app_name = available_apps[current_app];
            socket.emit("core-app_manager-stop_application", {
                application_name: last_app_name,
            });
            socket.emit("core-app_manager-start_application", {
                application_name: new_app_name,
            });
        } );
        sketch.enableElements();
        sketch.activated = true;

    };

    sketch.resume = () => {};
    sketch.pause = () => {};

    sketch.enableElements = () => {
        app_toggle.enabled = true;
    }

    sketch.disableElements = () => {
        app_toggle.enabled = false;
    }

    sketch.windowResized = () => {
        sketch.resizeCanvas(windowWidth, windowHeight);
    };


    sketch.update = () => {
        pointers.forEach((pointer) => {
            pointer.update();
            app_toggle.update(pointer);
        });
    };

    sketch.show = () => {
        sketch.clear();
        app_toggle.display(sketch);
    };


});
