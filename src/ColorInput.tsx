import React from 'react'
import { CIEDE2000, ColorLAB, ColorRGB, ColorXYZ, Hex_to_LAB, HLC_to_LAB, LAB_to_CSS, LAB_to_Hex, LAB_to_HLC, LAB_to_RGB, LAB_to_XYZ } from './Color';

interface ColorInputProps {
  colors: Array<ColorLAB>;
  id: number;
  handler: (colors: Array<ColorLAB>) => void;
}

export default class ColorInput extends React.Component<ColorInputProps> {
  render(): JSX.Element {
    const id: number = this.props.id;
    // make shallow copies of the color array and of our color
    const colors: Array<ColorLAB> = [...this.props.colors];
    const color: ColorLAB = { ...colors[id] };
    const hlc = LAB_to_HLC(color);

    // change function for L, a, and b
    const onChangeFunctionLAB = (prop: 'L' | 'a' | 'b') => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        color[prop] = parseFloat(e.target.value);
        colors[id] = color;
        this.props.handler(colors);
      }
    }
    
    // change function for HLC
    const onChangeFunctionHLC = (prop: 'H' | 'L' | 'C') => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        hlc[prop] = parseFloat(e.target.value);
        colors[id] = HLC_to_LAB(hlc);
        this.props.handler(colors);
      }
    }


    const onChangeHex = (e: React.ChangeEvent<HTMLInputElement>) => {
      colors[id] = Hex_to_LAB(e.target.value);
      this.props.handler(colors);
    }

    let id2: number = 0;
    const preview_boxes = colors.map((color2: ColorLAB) => {
      const css_color1: string = LAB_to_CSS(color);
      const css_color2: string = LAB_to_CSS(color2);
      return (
        <div className='ColorInputPreviewBox' key={id2++} style={{ backgroundColor: css_color1, color: css_color2 }}>
          {CIEDE2000(color, color2).toFixed(2)}
        </div>
      );
    });

    const xyz: ColorXYZ = LAB_to_XYZ(color);
    const rgb: ColorRGB = LAB_to_RGB(color);
    // 
    return (
      <div className='ColorInput'>
        <div className='ColorInputPreviewRow' >
          {preview_boxes}
        </div>
        <div className='ColorInputControls'>
          <input className='LABslider' type='range' min='0' max='100' value={color.L} onChange={onChangeFunctionLAB('L')} />
          <input className='LABInput' value={color.L} onChange={onChangeFunctionLAB('L')} />
          <span className='Spacer'> </span>
          <input className='LABslider' type='range' min='-128' max='127' value={color.a} onChange={onChangeFunctionLAB('a')} />
          <input className='LABInput' value={color.a} onChange={onChangeFunctionLAB('a')} />
          <span className='Spacer'> </span>
          <input className='LABslider' type='range' min='-128' max='127' value={color.b} onChange={onChangeFunctionLAB('b')} />
          <input className='LABInput' value={color.b} onChange={onChangeFunctionLAB('b')} />
        </div>
        <div className='ColorInputControls'>
          <input className='LABslider' type='range' min='0' max='100' value={hlc.L} onChange={onChangeFunctionHLC('L')} />
          <input className='LABInput' value={hlc.L} onChange={onChangeFunctionHLC('L')} />
          <span className='Spacer'> </span>
          <input className='LABslider' type='range' min='-180' max='180' value={hlc.H} onChange={onChangeFunctionHLC('H')} />
          <input className='LABInput' value={hlc.H} onChange={onChangeFunctionHLC('H')} />
          <span className='Spacer'> </span>
          <input className='LABslider' type='range' min='0' max='181' value={hlc.C} onChange={onChangeFunctionHLC('C')} />
          <input className='LABInput' value={hlc.C} onChange={onChangeFunctionHLC('C')} />
        </div>
        <input className='HexInput' value={LAB_to_Hex(color)} onChange={onChangeHex} />
        <span className='Spacer'> </span>
        RGB: {(rgb.R * 255).toFixed(0) + ', ' + (rgb.G * 255).toFixed(0) + ', ' + (rgb.B * 255).toFixed(0)}
        <span className='Spacer'> </span>
        rgb: {rgb.R.toFixed(3) + ', ' + rgb.G.toFixed(3) + ', ' + rgb.B.toFixed(3)}
        <span className='Spacer'> </span>
        XYZ: {xyz.X.toFixed(2) + ', ' + xyz.Y.toFixed(2) + ', ' + xyz.Z.toFixed(2)}
      </div>
    );
  }
}
