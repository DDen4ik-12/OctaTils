import Preact from "preact";
import { useState, useEffect } from "preact/hooks";
import { colorIsBright } from "../../lib/utils.js";

import * as styles from "./directoryRowIcon.css";

const iconPromises = {};

const getIcon = async (icon) => {
    const saveKey = `us-octatils:simple-icons:${icon}`;
    if (saveKey in sessionStorage) {
        return sessionStorage[saveKey];
    } else {
        return GM.xmlHttpRequest({
            url: `https://simpleicons.org/icons/${icon}.svg`,
        })
            .then((res) => {
                sessionStorage.setItem(saveKey, res.responseText);
                return res.responseText;
            });
    }
};

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
        const iconSvg = config.icon in iconPromises
            ? await iconPromises[config.icon]
            : await (iconPromises[config.icon] = getIcon(config.icon));

        const wrapper = document.createElement("div");
        wrapper.innerHTML = iconSvg;
        parent.setAttribute("viewBox", wrapper.querySelector("svg").getAttribute("viewBox"));
        setD(wrapper.querySelector("path").getAttribute("d"));
    }, []);

    return <path d={d || defaultD} />;
}

export default DirectoryRowIcon;