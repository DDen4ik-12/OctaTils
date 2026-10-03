import * as Preact from "preact";
import {
    RENDERED_LIST_SMBL,
    RENDERED_LIST_1ST_CHILD_SMBL,
    REACT_WRAPPER_QUERY,
    REACT_ROOT_QUERY,
} from "./vars.js";
import * as fiberUtils from "./lib/fiberUtils.js";
//import { Store, StoreProvider } from "./lib/store.js";
import { addOrCreateSet } from "./lib/utils.js";

/*
const store = new Store(
    (state, action) => {
        switch (action.type) {
            case "url.set": return { ...state, url: action.url };
            default: return state;
        }
    },
    { url: location.href },
);
navigation.addEventListener("navigatesuccess", () =>
    store.dispatch({ type: "url.set", url: location.href }));
*/

const reactRoots = new Map();
const renderList = [];

const push2RenderList = (component, finder, addingType, propsFn) => {
    renderList.push({ component, finder, addingType, propsFn });
};

const injectorObsvrClbk = () => {
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
    if (
        !reactRoots.has(document.documentElement) &&
        fiberUtils.of(document.documentElement)
    ) {
        reactRoots.set(
            document.documentElement,
            { root: document.documentElement },
        );
    }

    renderList.forEach(({ component: Component, finder, addingType, propsFn }) => {
        const findedList = finder.find();
        if (findedList.length === 0) return;
        findedList.forEach((finded) => {
            const findedIsArr = Array.isArray(finded);
            if (
                !(
                    findedIsArr
                        ? finded[0][RENDERED_LIST_1ST_CHILD_SMBL]
                        : finded[RENDERED_LIST_SMBL]
                )?.has?.(Component)
            ) {
                if (findedIsArr) {
                    addOrCreateSet(finded[0], RENDERED_LIST_1ST_CHILD_SMBL, Component);
                } else {
                    addOrCreateSet(finded, RENDERED_LIST_SMBL, Component);
                }
                let root, refParent, props;
                if (addingType === "set") {
                    if (findedIsArr) {
                        refParent = finded[0];
                        props = propsFn?.(refParent) || {};
                        root = document.createElement("div");
                        refParent.before(root);
                        finded.forEach((node) => node.remove());
                    } else {
                        refParent = root = finded;
                        props = propsFn?.(refParent) || {};
                        root.innerHTML = "";
                    }
                } else if (addingType === "append") {
                    if (findedIsArr) {
                        refParent = finded[finded.length - 1];
                        props = propsFn?.(refParent) || {};
                        root = document.createElement("div");
                        refParent.after(root);
                    } else {
                        refParent = finded;
                        props = propsFn?.(refParent) || {};
                        root = document.createElement("div");
                        refParent.append(root);
                    }
                } else if (addingType === "before") {
                    if (findedIsArr) {
                        refParent = finded[0];
                        props = propsFn?.(refParent) || {};
                        root = document.createElement("div");
                        refParent.before(root);
                    } else {
                        refParent = finded;
                        props = propsFn?.(refParent) || {};
                        root = document.createElement("div");
                        refParent.before(root);
                    }
                }
                Preact.render(
                    <Component {...{ parent: refParent, ...props }}/>,
                    root,
                );
            }
        });
    });
};

export {
    push2RenderList,
    injectorObsvrClbk,
    //store,
    reactRoots,
    renderList,
};