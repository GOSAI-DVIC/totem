from core.application import BaseApplication
import time
import os

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


    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "hand_pose" and data is not None:
            if event == "raw_data": self.server.send_data("totem_hand_pose", data)


def list_images():
    """list the images in the images folder"""
    images = []
    for file in os.listdir("home/apps/totem_app/images"):
        if file.endswith(".png"):
            images.append(file)
    return images

