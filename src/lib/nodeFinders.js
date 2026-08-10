import { reactRoots } from "../injecting.jsx";
import * as fiberUtils from "./fiberUtils.js";

class HtmlNodeFinder {
    constructor({ parentQuery, addingType = "set" }) {
        this.parentQuery = parentQuery;
        this.addingType = addingType;
    }
    find() {
        const findedTargets = document.querySelectorAll(this.parentQuery);
        return [...findedTargets].map((findedTarget) => ({
            node: findedTarget,
            addingType: this.addingType,
        }));
    }
}

class ReactNodeFinder {
    constructor({ parentQuery, addingType = "set", reactRoots }) {
        this.parentQuery = parentQuery;
        this.addingType = addingType;
        this.reactRoots = reactRoots;
    }
    _findIter(findedTargets, target, i) {
        if (this.parentQuery[i].type === "component") {
            let fiber;
            if (Array.isArray(target)) {
                fiber = fiberUtils.of(target[0]).return;
            } else {
                fiber = fiberUtils.of(target);
            }
            return [
                ...findedTargets,
                ...fiberUtils.htmlChildsByCompName(fiber, this.parentQuery[i].name),
            ];
        } else if (this.parentQuery[i].type === "cssQuery") {
            if (Array.isArray(target)) {
                return target.reduced((findedTargets, node) => [
                    ...findedTargets,
                    ...node.querySelectorAll(this.parentQuery[i].query),
                ], findedTargets);
            } else {
                return [
                    ...findedTargets,
                    ...target.querySelectorAll(this.parentQuery[i].query),
                ];
            }
        } else {
            return [];
        }
    }
    find() {
        let findedTargets = reactRoots.values().reduce((findedTargets, { root }) =>
            this._findIter(findedTargets, root, 0), []);
        for (let i = 1; i < this.parentQuery.length; i++) {
            findedTargets = findedTargets.reduce((findedTargets, target) =>
                this._findIter(findedTargets, target, i), []);
        }
        return findedTargets.map((findedTarget) => ({
            node: findedTarget,
            addingType: this.addingType,
        }));
    }
}

export { HtmlNodeFinder, ReactNodeFinder };