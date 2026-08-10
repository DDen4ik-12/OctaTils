const addOrCreateSet = (obj, key, value) => {
    if (key in obj) return obj[key].add(value);
    return (obj[key] = new Set([value]));
};

const colorIsBright = (hex) => {
    let r, g, b;
    if (/^#[0-9a-f]{3}$/i.test(hex)) {
        r = hex.slice(1, 2).repeat(2);
        g = hex.slice(2, 3).repeat(2);
        b = hex.slice(3).repeat(2);
    } else if (/^#[0-9a-f]{6}$/i.test(hex)) {
        r = hex.slice(1, 3);
        g = hex.slice(3, 5);
        b = hex.slice(5);
    } else {
        return false;
    }
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
    return Math.sqrt(
        0.299 * r ** 2 +
        0.587 * g ** 2 +
        0.114 * b ** 2
    ) > 142;
};

export { addOrCreateSet, colorIsBright };