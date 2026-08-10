const of = (el) => el ? (
    el[Object.keys(el).find((key) => key.startsWith("__reactFiber$"))] ||
    el[Object.keys(el).find((key) => key.startsWith("__reactContainer$"))]
) : undefined;

const parentWithProps = (fiber, props) => {
    let target = fiber;
    while (
        !props.isSubsetOf(new Set(Object.keys(target.memoizedProps ?? {})))
    ) {
        target = target.return;
    }
    return target;
};

const htmlRef = (fiber) => {
    let target = fiber;
    while (typeof target.type !== "string") {
        target = target.child;
    }
    if (!target.sibling) return target.stateNode;
    const siblings = [target.stateNode];
    while (target.sibling) {
        target = target.sibling;
        if (typeof target.type !== "string") siblings.push(target.stateNode);
    }
    return siblings;
};

const htmlChildsByCompName = (fiber, compName) => {
    let targets = [fiber?.child],
        nextTargets = [],
        findedTargets = [];
    if (!targets[0]) return [];
    do {
        nextTargets = [];
        targets.forEach((target) => {
            if (
                target.elementType === compName ||
                target.elementType?.displayName === compName
            ) {
                findedTargets.push(htmlRef(target));
            }
            if (target.child) nextTargets.push(target.child);
            if (target.sibling) nextTargets.push(target.sibling);
        });
        targets = nextTargets;
    } while (nextTargets.length > 0)
    return findedTargets;
};

export {
    of,
    parentWithProps,
    htmlRef,
    htmlChildsByCompName,
};