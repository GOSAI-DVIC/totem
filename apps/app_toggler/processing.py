from core.application import BaseApplication
from PIL import Image
import io
import base64
import json
import base64
import numpy as np

class Application(BaseApplication):
    """app_toggle"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.requires["hand_sign"] = ["sign"]

        self.hand_pose_data = {}


    def listener(self, source, event, data):
        super().listener(source, event, data)

        if source == "hand_pose" and event == "raw_data" and data is not None:
            self.hand_pose_data = data

        if source == "hand_sign" and event == "sign" and data is not None:
            self.hand_pose_data["hands_sign"] = data
            self.server.send_data(self.name, {"type": "hand_pose", "data": self.hand_pose_data})
