
export function hexToRgb(hex: string): [number, number, number] {
    const num = parseInt(hex.substring(1), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return [r, g, b];
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export function hexToHsv(hex: string): [number, number, number] {
    return rgbToHsv(hexToRgb(hex));
}

export function hsvToHex([h, s, l]: [number, number, number]): string {
    return rgbToHex(hsvToRgb([h, s, l]));
}

export function rgbToHsv([r, g, b]: [number, number, number]): [number, number, number] {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        switch (max) {
            case r:
                h = ((g - b) / delta);
                break;
            case g:
                h = ((b - r) / delta) + 2;
                break;
            case b:
                h = ((r - g) / delta) + 4;
                break;
        }
    }

    return [(h * 60 + 360) % 360, max === 0 ? 0 : delta / max, max / 255];
}

export function hsvToRgb([h, s, v]: [number, number, number]): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;
    switch (Math.floor(h / 60)) {
        case 0:
            r = c;
            g = x;
            break;
        case 1:
            r = x;
            g = c;
            break;
        case 2:
            g = c;
            b = x;
            break;
        case 3:
            g = x;
            b = c;
            break;
        case 4:
            r = x;
            b = c;
            break;
        case 5:
            r = c;
            b = x;
            break;
    }

    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}