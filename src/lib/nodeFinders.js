import { reactRoots } from "../injecting.jsx";
import * as fiberUtils from "./fiberUtils.js";

class HtmlNodeFinder {
    constructor(parentQuery) {
        this.parentQuery = parentQuery;
    }
    find() {
        return [...document.querySelectorAll(this.parentQuery)];
    }
}

class ReactNodeFinder {
    constructor(parentQuery) {
        this.parentQuery = parentQuery;
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
            root === null ? findedTargets : this._findIter(findedTargets, root, 0), []);
        for (let i = 1; i < this.parentQuery.length; i++) {
            findedTargets = findedTargets.reduce((findedTargets, target) =>
                this._findIter(findedTargets, target, i), []);
        }
        return findedTargets;
    }
}

export { HtmlNodeFinder, ReactNodeFinder };