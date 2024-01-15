from core.application import BaseApplication
import time

class Application(BaseApplication):
    """totem_app"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["hand_pose"] = ["raw_data"]
        self.time = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "hand_pose" and data is not None:
            if event == "raw_data": self.server.send_data("totem_hand_pose", data)