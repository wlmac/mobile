function fromJulian(j: any) {
    j = (+j) + (30.0 / (24 * 60 * 60));
    var A: any = julianArray(j, true);
    return new Date(Date.UTC.apply(Date, A));
};
function julianArray(j: any, n: any) {
    var F = Math.floor;
    var j2, JA, a, b, c, d, e, f, g, h, z;
    j += 0.5;
    j2 = (j - F(j)) * 86400.0;
    z = F(j);
    f = j - z;
    if (z < 2299161) a = z;
    else {
        g = F((z - 1867216.25) / 36524.25);
        a = z + 1 + g - F(g / 4);
    }
    b = a + 1524;
    c = F((b - 122.1) / 365.25);
    d = F(365.25 * c);
    e = F((b - d) / 30.6001);
    h = F((e < 14) ? (e - 1) : (e - 13));
    JA = [F((h > 2) ? (c - 4716) : (c - 4715)),
    h - 1, F(b - d - F(30.6001 * e) + f)];
    var JB = [F(j2 / 3600), F((j2 / 60) % 60), Math.round(j2 % 60)];
    JA = JA.concat(JB);
    if (typeof n == 'number') return JA.slice(0, n);
    return JA;
};
function getSeasons() {
    let wch: any;
    let y: any = new Date().getFullYear();
    if (y < 1000 || y > 3000) throw y + ' is out of range';
    var Y1 = (y - 2000) / 1000,
        Y2 = Y1 * Y1,
        Y3 = Y2 * Y1,
        Y4 = Y3 * Y1;
    var jd: any, t, w, d, est = 0,
        i = 0,
        Cos = degCos,
        A = [y],
        e1 = [485, 203, 199, 182, 156, 136, 77, 74, 70, 58, 52, 50, 45, 44, 29, 18, 17, 16, 14, 12, 12, 12, 9, 8],
        e2 = [324.96, 337.23, 342.08, 27.85, 73.14, 171.52, 222.54, 296.72, 243.58, 119.81, 297.17, 21.02,
            247.54, 325.15, 60.93, 155.12, 288.79, 198.04, 199.76, 95.39, 287.11, 320.81, 227.73, 15.45],
        e3 = [1934.136, 32964.467, 20.186, 445267.112, 45036.886, 22518.443,
            65928.934, 3034.906, 9037.513, 33718.147, 150.678, 2281.226,
            29929.562, 31555.956, 4443.417, 67555.328, 4562.452, 62894.029,
            31436.921, 14577.848, 31931.756, 34777.259, 1222.114, 16859.074];
    while (i < 4) {
        switch (i) {
            case 0:
                jd = 2451623.80984 + 365242.37404 * Y1 + 0.05169 * Y2 - 0.00411 * Y3 - 0.00057 * Y4;
                break;
            case 1:
                jd = 2451716.56767 + 365241.62603 * Y1 + 0.00325 * Y2 + 0.00888 * Y3 - 0.00030 * Y4;
                break;
            case 2:
                jd = 2451810.21715 + 365242.01767 * Y1 - 0.11575 * Y2 + 0.00337 * Y3 + 0.00078 * Y4;
                break;
            case 3:
                jd = 2451900.05952 + 365242.74049 * Y1 - 0.06223 * Y2 - 0.00823 * Y3 + 0.00032 * Y4;
                break;
        }
        t = (jd - 2451545.0) / 36525;
        w = 35999.373 * t - 2.47;
        d = 1 + 0.0334 * Cos(w) + 0.0007 * Cos(2 * w);
        est = 0;
        for (var n = 0; n < 24; n++) {
            est += e1[n] * Cos(e2[n] + (e3[n] * t));
        }
        jd += (0.00001 * est) / d;
        A[++i] = fromJulian(jd);
    }
    return wch && A[wch] ? A[wch] : A;
};
function degRad(d: number) {
    return (d * Math.PI) / 180.0;
};
function degCos(d: number) {
    return Math.cos(degRad(d));
};

//a complete overkill method adapted to TypeScript from https://stackoverflow.com/a/5671172

export default function getSeason() : string {
    var mine = getSeasons();
    let today = new Date();
    let firstSpring = mine[1];
    let firstSummer = mine[2];
    let firstFall = mine[3];
    let firstWinter = mine[4];
    var season = '';
    if (today >= firstSpring && today < firstSummer) {
        season = 'spring';
    } else if (today >= firstSummer && today < firstFall) {
        season = 'summer';
    } else if (today >= firstFall && today < firstWinter) {
        season = 'fall';
    } else if (today >= firstWinter || today < firstSpring) {
        season = 'winter';
    }
    return season;
}