
export function hexToRgb(hex: string): [number, number, number] {
    const num = parseInt(hex.substring(1, 6), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return [r, g, b];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export function hexToHsl(hex: string): [number, number, number] {
    return rgbToHsl(hexToRgb(hex));
}

export function hslToHex([h, s, l]: [number, number, number]): string {
    return rgbToHex(hslToRgb([h, s, l]));
}

// https://gist.github.com/vahidk/05184faf3d92a0aa1b46aeaa93b07786

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;
    let h: number;
    if (d === 0)        h = 0;
    else if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else                h = (r - g) / d + 4;
    let l = (min + max) / 2;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [h * 60, s, l];
}

export function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hp = h / 60.0;
    let x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1: [number, number, number];
    if (isNaN(h))     rgb1 = [0, 0, 0];
    else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else              rgb1 = [c, 0, x];
    let m = l - c * 0.5;
    return [
        Math.round(255 * (rgb1[0] + m)),
        Math.round(255 * (rgb1[1] + m)),
        Math.round(255 * (rgb1[2] + m))];
}