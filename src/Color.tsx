
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
    b: color.C * Math.sin(rad(color.H))
  };
}

export function LAB_to_HLC(color: ColorLAB): ColorHLC {
  return {
    H: deg(Math.atan2(color.a, color.b)),
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
  const fz: number = fy - b / 2000;

  const x: number = fx ** 3 > eps ? fx ** 3 : (116 * fx - 16) / kappa;
  const y: number = L > kappa * eps ? ((L + 16) / 116) ** 3 : L / kappa;
  const z: number = fz ** 3 > eps ? fz ** 3 : (116 * fz - 16) / kappa;

  return { x: x, y: y, z: z };
}

export function XYZ_to_LAB(color: ColorXYZ): ColorLAB {
  const {x, y, z } = color;

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
