#!/bin/bash

# Open Tilix
tilix &

# Wait for Tilix to open
sleep 2

# Get the window ID of the last opened Tilix window
WID=$(xdotool search --class Tilix | tail -1)


# Focus the window
xdotool windowfocus $WID

# put in fullscreen
xdotool key --window $WID F11

# Send the command to the first terminal and press Enter
sleep 1
xdotool type --window $WID "htop"
xdotool key --window $WID Return

# Split the window horizontally and run the command
xdotool key --window $WID ctrl+shift+h
sleep 1
xdotool type --window $WID "nvtop"
xdotool key --window $WID Return

# Split the window and run the command in the new terminal
xdotool key --window $WID ctrl+shift+h
xdotool type --window $WID "cd ~/nico/gosai"
xdotool key --window $WID Return

xdotool type --window $WID "make stop && make boot"
xdotool key --window $WID Return


sleep 1
#  start firefox on youtube, with a command to play a video
firefox --new-window  127.0.0.1:8000/gosai/totem/control &
