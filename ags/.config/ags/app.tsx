#!/usr/bin/env -S ags run
import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import style from "./style.css"
import Powermenu from "./widget/Powermenu"
import Workspaces from "./widget/Workspaces"
import Clock from "./widget/Clock"
import Network from "./widget/Network"
import Backlight from "./widget/Backlight"
import AudioSource from "./widget/AudioSource"
import Audio from "./widget/Audio"
import Battery from "./widget/Battery"
import Tray from "./widget/Tray"
import Notifications from "./widget/Notifications"

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

app.start({
    css: style,
    main() {
        app.get_monitors().map((monitor: Gdk.Monitor) => (
            <window
                name="Bar"
                application={app}
                visible
                class="Bar"
                gdkmonitor={monitor}
                exclusivity={Astal.Exclusivity.EXCLUSIVE}
                anchor={TOP | LEFT | RIGHT}
                marginTop={2}
                marginLeft={4}
                marginRight={4}
                marginBottom={2}
            >
                <centerbox>
                    <box $type="start" hexpand halign={Gtk.Align.START} spacing={4} class="modules-start">
                        <Powermenu />
                        <Workspaces />
                        <Tray />
                    </box>
                    <box $type="center" class="modules-center">
                        <Clock />
                    </box>
                    <box $type="end" hexpand halign={Gtk.Align.END} spacing={4} class="modules-end">
                        <Network />
                        <Backlight />
                        <AudioSource />
                        <Audio />
                        <Battery />
                    </box>
                </centerbox>
            </window>
        ))
        app.get_monitors().map((monitor: Gdk.Monitor) => (
            <window
                visible
                class="Notifications"
                gdkmonitor={monitor}
                anchor={TOP | RIGHT}
                marginTop={2}
                marginRight={4}
            >
                <Notifications />
            </window>
        ))
    },
})
