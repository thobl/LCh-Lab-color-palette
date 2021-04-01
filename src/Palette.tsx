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
  }

  private colors: Array<ColorHLC>;

  render(): JSX.Element {
    const items = this.colors.map((color: ColorHLC) => {
      const xyz = HLC_to_XYZ(color);
      const rgb = "rgb(" + 255 * xyz.x + "," + 255 * xyz.y + "," + 255 * xyz.z + ")"
      return(<Circle key={"circle_" + rgb} x={2 * color.H + 360} y={2.5 * color.C} r={color.L} color={rgb} />)
    });
    return (
      <div>
        {items}
      </div>
    );
  }
}

export default Palette;
