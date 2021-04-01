import React from 'react'
import { ColorHLC, ColorXYZ, XYZ_to_HLC, HLC_to_XYZ } from './Color'
import Circle from './Circle'

interface PaletteProps {
  base: ColorXYZ;
  color1: ColorXYZ;
  n: number;
}

class Palette extends React.Component<PaletteProps> {
  constructor(props: PaletteProps) {
    super(props);
    this.colors = [XYZ_to_HLC(props.base), XYZ_to_HLC(props.color1)];
    for (let i = 1; i < props.n; i++) {
      this.colors.push(XYZ_to_HLC({ x: Math.random(), y: Math.random(), z: Math.random() }));
    }
    // this.colors = [props.base, props.color1];
    // for (let i = 1; i < props.n; i++) {
    //   this.colors.push({ x: Math.random(), y: Math.random(), z: Math.random() });
    // }
  }

  private colors: Array<ColorHLC>;
  // private colors: Array<ColorXYZ>;

  render(): JSX.Element {
    const items = this.colors.map((color: ColorHLC) => {
    // const items = this.colors.map((color: ColorXYZ) => {
      const xyz = HLC_to_XYZ(color);
      // const xyz = color;
      // const hlc = XYZ_to_HLC(xyz);
      const rgb = "rgb(" + 255 * xyz.x + "," + 255 * xyz.y + "," + 255 * xyz.z + ")"
      return(<Circle x={color.H} y={color.C} r={color.L} color={rgb} />)
      // return(<Circle x={hlc.H + 180} y={hlc.C} r={hlc.L} color={rgb} />)
    });
    return (
      <div>
        {items}
      </div>
    );
  }
}

export default Palette;
