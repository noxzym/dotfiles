#!/bin/bash

choice=$(printf "Area\nWindow\nFullscreen" | tofi --config ~/.config/hypr/scripts/screenshot/config.ini)

case "$choice" in
    "Area")
      grimblast copy area
      ;;
    "Window")
      grimblast copy active
      ;;
    "Fullscreen")
      grimblast copy screen
      ;;
esac
