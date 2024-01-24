from core.application import BaseApplication
from PIL import Image
import io
import base64
import json
import base64
import numpy as np

class Application(BaseApplication):
    """sdxl_app"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["hand_sign"] = ["sign"]
        self.requires["sdxl_api"] = ["response"]

        self.hand_pose_data = {}

        @self.server.sio.on("sdxl_save")
        def save(data):
            input_ = data["input"].split(",")[1]
            output = data["output"].split(",")[1]
            decoded_input_ = base64.b64decode(input_)
            decoded_output = base64.b64decode(output)
            Image.open(io.BytesIO(decoded_input_)).save("/home/cortega/nico/gosai/home/apps/sdxl_app/inputs/test.png")
            Image.open(io.BytesIO(decoded_output)).save("/home/cortega/nico/gosai/home/apps/sdxl_app/outputs/test.png")
            Image.open(io.BytesIO(decoded_output)).save("/home/cortega/nico/gosai/home/apps/totem_app/images/test.png") #! this is a hack to make the totem app work

        @self.server.sio.on("sdxl_paint")
        def paint(data):
            """Starts the calibration process of painting"""
            img = data["img"].split(",")[1]
            img = base64.b64decode(img)
            api_data = {
                "prompt": data["prompt"], # the text prompt, including drawing style highly improves the quality of the output
                "strength": 0.93, #! strength * steps must be greater than 1
                "steps": 3, # number of diffusion steps (2-3 are enough) more diffusion follows more the prompt
                "seed": 42, # a fixed seed so that the same input will give the same output (-1 for random)
                "noise": 20, # adds noise to the input image so that texture is added to the output
                "k": 0, # color digitization (3-10 are enough) 0 is disabled
                "debug": False # logs the produced images on the backend
            }
            payload = json.dumps(api_data).encode() + b'\n'+img
            self.db.set("sdxl_api", payload)


    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.hand_pose_data = data

        if source == "hand_sign" and event == "sign" and data is not None:
            self.hand_pose_data["hands_sign"] = data
            self.server.send_data(self.name, {"type": "hand_pose", "data": self.hand_pose_data})
        
        if source == "sdxl_api" and event == "response" and data is not None:
            self.server.send_data("sdxl_api_response", data)
