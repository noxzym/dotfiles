#!/bin/bash

choice=$(printf "Area\nWindow\nFullscreen" | tofi)
sleep 0.3
case "$choice" in
    "Area")
      grimblast --notify copy area
      ;;
    "Window")
      grimblast --notify copy active
      ;;
    "Fullscreen")
      grimblast --notify copy screen
      ;;
esac
