from core.application import BaseApplication
import time
import os
import threading
import cv2
import numpy as np

otherim = cv2.imread("/home/cortega/nico/gosai/home/apps/totem_app/images/00.png")

class Application(BaseApplication):
    """totem_app"""
    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        # self.requires["face_detection"] = ["raw_data"]
        self.time = 0
        @server.sio.on("totem_get_images")
        def get_images():
            server.send_data("totem_images", list_images())
        @server.sio.on("totem_set_image")
        def set_image(image):
            # self.db.publish("totem_set_image", image)
            self.db.set("totem_set_image", image)
            # print("set_image", image)
        threading.Thread(target=self.subscriber, args=("totem", "out_image")).start()
        threading.Thread(target=self.subscriber, args=("totem", "in_image")).start()


    def listener(self, source, event, data):
        # super().listener(source, event, data)
        
        if source == "hand_pose" and data is not None:
            if event == "raw_data": self.server.send_data("totem_hand_pose", data)
        if source == "totem" and event == "out_image" and data is not None:
            # convert the image to base64
            # data = str(data.tolist())
            # data = base64.b64encode(data)
            # self.server.send_data("totem_out_image", data.tolist())
            _, buffer = cv2.imencode('.png', data)
            buffer = buffer.tobytes()
            self.server.send_data("totem_out_image", buffer)
            # print("out_image", buffer)
        if source == "totem" and event == "in_image" and data is not None:
            _, buffer = cv2.imencode('.png', data)
            buffer = buffer.tobytes()
            self.server.send_data("totem_in_image", buffer)
            


def list_images():
    """list the images in the images folder"""
    images = []
    for file in os.listdir("home/apps/totem_app/images"):
        if file.endswith(".png"):
            images.append(file)
    return images

