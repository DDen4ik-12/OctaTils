import * as Preact from "preact";
import {
    RENDERED_LIST_SMBL,
    RENDERED_LIST_1ST_CHILD_SMBL,
    REACT_WRAPPER_QUERY,
    REACT_ROOT_QUERY,
} from "./vars.js";
import { addOrCreateSet } from "./lib/utils.js";

const reactRoots = new Map();
const renderList = [];

const push2RenderList = (component, finder, propsFn) => {
    renderList.push({ component, finder, propsFn });
};

const injectorObsvrClbk = (mutationsList) => {
    const newReactWrappers = [...document.querySelectorAll(REACT_WRAPPER_QUERY)];
    reactRoots.keys().forEach((wrapper) => {
        if (!newReactWrappers.includes(wrapper)) {
            reactRoots.delete(wrapper);
        }
    });
    newReactWrappers.forEach((wrapper) => {
        const root = wrapper.querySelector(REACT_ROOT_QUERY);
        reactRoots.set(wrapper, { root });
    });

    renderList.forEach(({ component: Component, finder, propsFn }) => {
        const findedList = finder.find();
        if (findedList.length === 0) return;
        findedList.forEach((finded) => {
            const findedIsArr = Array.isArray(finded.node);
            if (
                !(
                    findedIsArr
                        ? finded.node[0][RENDERED_LIST_1ST_CHILD_SMBL]
                        : finded.node[RENDERED_LIST_SMBL]
                )?.has?.(Component)
            ) {
                if (findedIsArr) {
                    addOrCreateSet(finded.node[0], RENDERED_LIST_1ST_CHILD_SMBL, Component);
                } else {
                    addOrCreateSet(finded.node, RENDERED_LIST_SMBL, Component);
                }
                let renderParent, refParent, props;
                if (finded.addingType === "set") {
                    if (findedIsArr) {
                        refParent = finded.node[0];
                        props = propsFn?.(refParent) || {};
                        renderParent = document.createElement("div");
                        refParent.before(renderParent);
                        finded.node.forEach((node) => node.remove());
                    } else {
                        refParent = renderParent = finded.node;
                        props = propsFn?.(refParent) || {};
                        renderParent.innerHTML = "";
                    }
                } else if (finded.addingType === "append") {
                    if (findedIsArr) {
                        refParent = finded.node[finded.node.length - 1];
                        props = propsFn?.(refParent) || {};
                        renderParent = document.createElement("div");
                        refParent.after(renderParent);
                    } else {
                        refParent = finded.node;
                        props = propsFn?.(refParent) || {};
                        renderParent = document.createElement("div");
                        refParent.append(renderParent);
                    }
                } else if (finded.addingType === "before") {
                    if (findedIsArr) {
                        refParent = finded.node[0];
                        props = propsFn?.(refParent) || {};
                        renderParent = document.createElement("div");
                        refParent.before(renderParent);
                    } else {
                        refParent = finded.node;
                        props = propsFn?.(refParent) || {};
                        renderParent = document.createElement("div");
                        refParent.before(renderParent);
                    }
                }
                Preact.render(
                    <Component {...{ parent: refParent, ...props }}/>,
                    renderParent,
                );
            }
        });
    });
};

export {
    push2RenderList,
    injectorObsvrClbk,
    reactRoots,
    renderList,
};