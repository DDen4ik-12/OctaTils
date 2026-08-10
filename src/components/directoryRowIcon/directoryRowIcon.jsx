import Preact from "preact";
import { useState, useEffect } from "preact/hooks";
import { colorIsBright } from "../../lib/utils.js";

import * as styles from "./directoryRowIcon.css";

function DirectoryRowIcon({ parent, defaultD, config }) {
    const [d, setD] = useState(null);

    useEffect(async () => {
        parent.classList.add(styles.directoryRowIcon);
        Object.assign(parent.style, {
            fill: config?.color
                ? colorIsBright(config.color) ? "#1f2328" : "#ffffff"
                : "var(--bgColor-default, var(--color-canvas-default))",
            background: config?.color || "currentColor",
        });

        if (!config?.icon || !/[a-z0-9]+/.test(config.icon)) return;
        const saveKey = `us-octatils:simple-icons:${config.icon}`;
        let iconSvg;
        if (saveKey in sessionStorage) {
            iconSvg = sessionStorage[saveKey];
        } else {
            iconSvg = (
                await GM.xmlHttpRequest({
                    url: `https://simpleicons.org/icons/${config.icon}.svg`,
                })
            ).responseText;
            sessionStorage.setItem(saveKey, iconSvg);
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = iconSvg;
        parent.setAttribute("viewBox", wrapper.querySelector("svg").getAttribute("viewBox"));
        setD(wrapper.querySelector("path").getAttribute("d"));
    }, []);

    return <path d={d || defaultD} />;
}

export default DirectoryRowIcon;