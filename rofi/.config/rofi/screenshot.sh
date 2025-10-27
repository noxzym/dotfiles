area=""
window=""
fullscreen=""

theme="./theme.rasi"

menu() {
    rofi -mesg "Select Screenshot Mode" -dmenu -theme $theme
}

run() {
    echo -e "$area\n$window\n$fullscreen" | menu
}

select="$(run)"
sleep 0.3
case $select in
    $area)
        grimblast --notify copy area
        ;;
    $window)
        grimblast --notify copy active
        ;;
    $fullscreen)
        grimblast --notify copy screen
        ;;
esac
