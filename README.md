# Totem platform

## Overview

The totem platform currently has 2 apps: **RealTime Deep Fake**, **sdxl art**.

### RealTime Deep Fake

This app is a real time deep fake app. It uses a pre-trained model, called first-order motion, to detect faces and control them with a the camera.
It uses the gosai app "totem_app" and teh script "app.py" to run. The script requires different dependencies then GOSAI, so it is run as a sepearte script not a part of the GOSAI.

### SDXL Art

This app uses sdxl turbo by stability.ai to generate art. It uses the gosai app "totem_app" and the script "sdxl_api". The sdxl turbo model requires 9 GB of Vram and thus runs on the dgx. The sdxl endpoint can be found [here](https://github.com/COLVERTYETY/sdxlTurboEndpoint).

## installation

Please refer to the [GOSAI](https://github.com/GOSAI-DVIC/gosai) tutorial for installation.

**! Note ! :** This platform has specific drivers that are only available on teh branch ```Nstas/togtem-dev```. Can be found [here](https://github.com/GOSAI-DVIC/gosai/tree/Nstas/totem-dev).

## Launch

Simply enter `make stop && make boot` on the terminal

The sdxl enpoitn needs to be manually launched on the dgx.