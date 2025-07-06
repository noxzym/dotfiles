#!/bin/bash

choice=$(printf "Signout\nReboot\nShutdown" | tofi)
sleep 0.3

confirm() {
    confirm_choice=$(printf "Tidak\nYa" | tofi --prompt-text "Apakah Anda yakin?")
    [[ "$confirm_choice" == "Ya" ]]
}

case "$choice" in
"Signout")
    if confirm; then
        hyprctl dispatch exit
    fi
    ;;
"Reboot")
    if confirm; then
        reboot
    fi
    ;;
"Shutdown")
    if confirm; then
        shutdown now
    fi
    ;;
esac
