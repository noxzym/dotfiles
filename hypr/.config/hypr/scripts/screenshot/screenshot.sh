#!/bin/bash

choice=$(printf "Area\nWindow\nFullscreen" | tofi)

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
