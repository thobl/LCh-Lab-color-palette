
//////////////////////////////////////////////////////////////////////
// definition of color types

export interface ColorHLC {
  H: number;
  L: number;
  C: number;
}

export interface ColorLAB {
  L: number;
  a: number;
  b: number;
}

export interface ColorXYZ {
  x: number;
  y: number;
  z: number;
}

//////////////////////////////////////////////////////////////////////
// conversion between color types; see www.brucelindbloom.com and
// en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_model

export function HLC_to_LAB(color: ColorHLC): ColorLAB {
  return {
    L: color.L,
    a: color.C * Math.cos(rad(color.H)),
    b: color.C * Math.sin(rad(color.H)),
  };
}

export function LAB_to_HLC(color: ColorLAB): ColorHLC {
  return {
    H: deg(Math.atan2(color.b, color.a)),
    L: color.L,
    C: Math.sqrt(color.a ** 2 + color.b ** 2)
  };
}

const eps: number = 216 / 24389;
const kappa: number = 24389 / 27;

export function LAB_to_XYZ(color: ColorLAB): ColorXYZ {
  const { L, a, b } = color;

  const fy: number = (L + 16) / 116;
  const fx: number = a / 500 + fy;
  const fz: number = fy - b / 200;

  const x: number = fx ** 3 > eps ? fx ** 3 : (116 * fx - 16) / kappa;
  const y: number = L > kappa * eps ? ((L + 16) / 116) ** 3 : L / kappa;
  const z: number = fz ** 3 > eps ? fz ** 3 : (116 * fz - 16) / kappa;

  return { x: x, y: y, z: z };
}

export function XYZ_to_LAB(color: ColorXYZ): ColorLAB {
  const { x, y, z } = color;

  const fx: number = x > eps ? x ** (1 / 3) : (kappa * x + 16) / 116;
  const fy: number = y > eps ? y ** (1 / 3) : (kappa * y + 16) / 116;
  const fz: number = z > eps ? z ** (1 / 3) : (kappa * z + 16) / 116;

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

export function XYZ_to_HLC(color: ColorXYZ): ColorHLC {
  return LAB_to_HLC(XYZ_to_LAB(color));
}

export function HLC_to_XYZ(color: ColorHLC): ColorXYZ {
  return LAB_to_XYZ(HLC_to_LAB(color));
}

export function XYZ_to_CSS(color: ColorXYZ): string {
  return "rgb(" + 255 * color.x + "," + 255 * color.y + "," + 255 * color.z + ")";
}

export function LAB_to_CSS(color: ColorLAB): string {
  return XYZ_to_CSS(LAB_to_XYZ(color));
}

export function HLC_to_CSS(color: ColorHLC): string {
  return XYZ_to_CSS(HLC_to_XYZ(color));
}

//////////////////////////////////////////////////////////////////////
// difference according to CIEDE2000; see
// http://www.ece.rochester.edu/~gsharma/ciede2000/ciede2000noteCRNA.pdf
//
// Numbers are according to the equation labels in that document.

export function CIEDE2000(color1: ColorLAB, color2: ColorLAB): number {
  let { L: L1, a: a1, b: b1 } = color1;
  let { L: L2, a: a2, b: b2 } = color2;

  const kL: number = 1;
  const kC: number = 1;
  const kH: number = 1;

  // (2)
  let C1: number = Math.sqrt(a1 ** 2 + b1 ** 2);
  let C2: number = Math.sqrt(a2 ** 2 + b2 ** 2);

  // (3) (additionally: to the power of 7)
  let C_avg7: number = ((C1 + C2) / 2) ** 7;

  // (4)
  const G: number = 0.5 * (1 - Math.sqrt(C_avg7 / (C_avg7 + 25 ** 7)));

  // (5)
  a1 = (1 + G) * a1;
  a2 = (1 + G) * a2;

  // (6)
  C1 = Math.sqrt(a1 ** 2 + b1 ** 2);
  C2 = Math.sqrt(a2 ** 2 + b2 ** 2);

  // (7)
  const deg_atan2 = (a: number, b: number): number => {
    const res = deg(Math.atan2(b, a));
    return res >= 0 ? res : res + 360;
  }
  let h1: number = a1 === 0 && b1 === 0 ? 0 : deg_atan2(a1, b1);
  let h2: number = a2 === 0 && b2 === 0 ? 0 : deg_atan2(a2, b2);

  // (8)
  const dL: number = L2 - L1;

  // (9)
  const dC: number = C2 - C1;

  // (10)
  const dh: number = ((): number => {
    if (C1 * C2 === 0) return 0;
    if (Math.abs(h2 - h1) <= 180) return h2 - h1;
    if (h2 - h1 > 180) return h2 - h1 - 360;
    return h2 - h1 + 360; // if (h2 - h1 < -180) 
  })();

  // (11)
  const dH = 2 * Math.sqrt(C1 * C2) * Math.sin(rad(dh / 2));

  // (12)
  const L_avg: number = (L1 + L2) / 2;

  // (13) (additionally: to the power of 7)
  const C_avg = (C1 + C2) / 2;
  C_avg7 = C_avg ** 7;

  // (14)
  const h_avg: number = ((): number => {
    if (C1 * C2 === 0) return h1 + h2;
    if (Math.abs(h1 - h2) <= 180) return (h1 + h2) / 2;
    if (Math.abs(h1 - h2) > 180 && h1 + h2 < 360) return (h1 + h2 + 360) / 2;
    return (h1 + h2 - 360) / 2 // if (Math.abs(h1 - h2) > 180 && h1 + h2 >= 360)
  })();

  // (15)
  const T: number = 1
    - 0.17 * Math.cos(rad(h_avg - 30))
    + 0.24 * Math.cos(rad(2 * h_avg))
    + 0.32 * Math.cos(rad(3 * h_avg + 6))
    - 0.2 * Math.cos(rad(4 * h_avg - 63));

  // (16)
  const dtheta: number = 30 * Math.exp(- (((h_avg - 275) / 25) ** 2));

  // (17)
  const RC: number = 2 * Math.sqrt(C_avg7 / (C_avg7 + 25 ** 7));

  // (18)
  const SL: number = 1 + 0.015 * ((L_avg - 50) ** 2) / Math.sqrt(20 + (L_avg - 50) ** 2);

  // (19)
  const SC: number = 1 + 0.045 * C_avg;

  // (20)
  const SH: number = 1 + 0.015 * C_avg * T;

  // (21)
  const RT = - Math.sin(rad(2 * dtheta)) * RC;

  // (22)
  const dE: number = Math.sqrt(
    (dL / (kL * SL)) ** 2 +
    (dC / (kC * SC)) ** 2 +
    (dH / (kH * SH)) ** 2 +
    RT * (dC / (kC * SC)) * (dH / (kH * SH)));

  return dE;
}

function deg(rad: number): number {
  return rad * 180 / Math.PI;
}

function rad(deg: number): number {
  return deg * Math.PI / 180;
}


export function check_conversion() {
  const xyz1: ColorXYZ = {x: Math.random(), y: Math.random(), z: Math.random()};
  const lab1: ColorLAB = XYZ_to_LAB(xyz1);
  const hlc: ColorHLC = LAB_to_HLC(lab1);
  const lab2: ColorLAB = HLC_to_LAB(hlc);
  const xyz2: ColorXYZ = LAB_to_XYZ(lab2);
  console.log("xyz", xyz1, "lab", lab1, "hlc", hlc, "lab", lab2, "xyz", xyz2);
}

export function check_CIEDE2000() {
  let i = 1;
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.6772, b: -79.7751 }, { L: 50.0000, a: 0.0000, b: -82.7485 }) - 2.0425)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 3.1571, b: -77.2803 }, { L: 50.0000, a: 0.0000, b: -82.7485 }) - 2.8615)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.8361, b: -74.0200 }, { L: 50.0000, a: 0.0000, b: -82.7485 }) - 3.4412)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -1.3802, b: -84.2814 }, { L: 50.0000, a: 0.0000, b: -82.7485 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -1.1848, b: -84.8006 }, { L: 50.0000, a: 0.0000, b: -82.7485 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -0.9009, b: -85.5211 }, { L: 50.0000, a: 0.0000, b: -82.7485 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 0.0000, b: 0.0000 }, { L: 50.0000, a: -1.0000, b: 2.0000 }) - 2.3669)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -1.0000, b: 2.0000 }, { L: 50.0000, a: 0.0000, b: 0.0000 }) - 2.3669)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.4900, b: -0.0010 }, { L: 50.0000, a: -2.4900, b: 0.0009 }) - 7.1792)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.4900, b: -0.0010 }, { L: 50.0000, a: -2.4900, b: 0.0010 }) - 7.1792)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.4900, b: -0.0010 }, { L: 50.0000, a: -2.4900, b: 0.0011 }) - 7.2195)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.4900, b: -0.0010 }, { L: 50.0000, a: -2.4900, b: 0.0012 }) - 7.2195)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -0.0010, b: 2.4900 }, { L: 50.0000, a: 0.0009, b: -2.4900 }) - 4.8045)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -0.0010, b: 2.4900 }, { L: 50.0000, a: 0.0010, b: -2.4900 }) - 4.8045)
  console.log(i++, CIEDE2000({ L: 50.0000, a: -0.0010, b: 2.4900 }, { L: 50.0000, a: 0.0011, b: -2.4900 }) - 4.7461)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 50.0000, a: 0.0000, b: -2.5000 }) - 4.3065)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 73.0000, a: 25.0000, b: -18.0000 }) - 27.1492)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 61.0000, a: -5.0000, b: 29.0000 }) - 22.8977)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 56.0000, a: -27.0000, b: -3.0000 }) - 31.9030)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 58.0000, a: 24.0000, b: 15.0000 }) - 19.4535)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 50.0000, a: 3.1736, b: 0.5854 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 50.0000, a: 3.2972, b: 0.0000 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 50.0000, a: 1.8634, b: 0.5757 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 50.0000, a: 2.5000, b: 0.0000 }, { L: 50.0000, a: 3.2592, b: 0.3350 }) - 1.0000)
  console.log(i++, CIEDE2000({ L: 60.2574, a: -34.0099, b: 36.2677 }, { L: 60.4626, a: -34.1751, b: 39.4387 }) - 1.2644)
  console.log(i++, CIEDE2000({ L: 63.0109, a: -31.0961, b: -5.8663 }, { L: 62.8187, a: -29.7946, b: -4.0864 }) - 1.2630)
  console.log(i++, CIEDE2000({ L: 61.2901, a: 3.7196, b: -5.3901 }, { L: 61.4292, a: 2.2480, b: -4.9620 }) - 1.8731)
  console.log(i++, CIEDE2000({ L: 35.0831, a: -44.1164, b: 3.7933 }, { L: 35.0232, a: -40.0716, b: 1.5901 }) - 1.8645)
  console.log(i++, CIEDE2000({ L: 22.7233, a: 20.0904, b: -46.6940 }, { L: 23.0331, a: 14.9730, b: -42.5619 }) - 2.0373)
  console.log(i++, CIEDE2000({ L: 36.4612, a: 47.8580, b: 18.3852 }, { L: 36.2715, a: 50.5065, b: 21.2231 }) - 1.4146)
  console.log(i++, CIEDE2000({ L: 90.8027, a: -2.0831, b: 1.4410 }, { L: 91.1528, a: -1.6435, b: 0.0447 }) - 1.4441)
  console.log(i++, CIEDE2000({ L: 90.9257, a: -0.5406, b: -0.9208 }, { L: 88.6381, a: -0.8985, b: -0.7239 }) - 1.5381)
  console.log(i++, CIEDE2000({ L: 6.7747, a: -0.2908, b: -2.4247 }, { L: 5.8714, a: -0.0985, b: -2.2286 }) - 0.6377)
  console.log(i++, CIEDE2000({ L: 2.0776, a: 0.0795, b: -1.1350 }, { L: 0.9033, a: -0.0636, b: -0.5514 }) - 0.9082)
}
