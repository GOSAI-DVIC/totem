from core.application import BaseApplication
import time

class Application(BaseApplication):
    """<template_app>"""

    def __init__(self, name, hal, server, manager):
        super().__init__(name, hal, server, manager)
        self.requires["<driver_name>"] = ["<driver_event>"]
        self.time = 0

    def listener(self, source, event, data):
        super().listener(source, event, data)
        
        if source == "<driver_name>" and data is not None:
            if event == "<driver_event>": self.server.send_data("<event_data_name>", data)