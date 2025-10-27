shutdown=""
reboot=""
suspend=""
logout=""

yes=""
no=""

theme="./theme.rasi"

menu() {
    rofi -mesg "$1" -dmenu -theme $theme
}

confirm() {
    action=$1
    echo -e "$yes\n$no"  | menu "Are you sure you want to $action?"
}

run() {
    echo -e "$shutdown\n$reboot\n$suspend\n$logout" | menu "Power Menu"
}

select="$(run)"
case $select in
    $shutdown)
        ans=$(confirm "Shutdown")
        if [ "$ans" == "$yes" ]; then
            systemctl poweroff
        fi
        ;;
    "$reboot")
        ans=$(confirm "Reboot")
        if [ "$ans" == "$yes" ]; then
            systemctl reboot
        fi
        ;;
    "$suspend")
        ans=$(confirm "Sleep")
        if [ "$ans" == "$yes" ]; then
            systemctl sleep
        fi
        ;;
    "$logout")
        ans=$(confirm "Signout")
        if [ "$ans" == "$yes" ]; then
            hyprctl dispatch exit
        fi
        ;;
esac
