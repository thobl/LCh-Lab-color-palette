import React from 'react'
import { CIEDE2000, Color, ColorLAB, ColorRGB, ColorXYZ, Hex_to_LAB, HLC_to_LAB, LAB_to_CSS, LAB_to_Hex, LAB_to_HLC, LAB_to_RGB, LAB_to_XYZ } from './Color';

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

    const input = <T extends Color>(
      prop: keyof T,
      inputType: 'txt' | 'sld',
      min: number, max: number,
      convFromLAB: (color: ColorLAB) => T,
      convToLAB: (col: T) => ColorLAB) => {

      let col: T = convFromLAB(color);

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let change: any = {};
        change[prop] = Math.min(max, Math.max(min, parseFloat(e.target.value)));
        const col_new = { ...col, ...change };
        colors[id] = convToLAB(col_new);
        this.props.handler(colors);
      }

      if (inputType == 'txt') {
        return (
          <input className='ParamInput' value={col[prop].toFixed(2)} onChange={onChange} />
        );
      }
      return (
        <input className='Slider' type='range' min={min} max={max} value={col[prop]} onChange={onChange} />
      )
    };
    const identity = <T extends unknown>(inp: T): T => {
      return inp;
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


    return (
      <div className='ColorInput'>
        <div className='ColorInputControls'>
          {input('L', 'sld', 0, 100, identity, identity)}
          {input('L', 'txt', 0, 100, identity, identity)}
          <span className='Spacer'> </span>
          {input('a', 'sld', -128, 127, identity, identity)}
          {input('a', 'txt', -128, 127, identity, identity)}
          <span className='Spacer'> </span>
          {input('b', 'sld', -128, 127, identity, identity)}
          {input('b', 'txt', -128, 127, identity, identity)}
        </div>
        <div className='ColorInputControls'>
          {input('L', 'sld', 0, 100, LAB_to_HLC, HLC_to_LAB)}
          {input('L', 'txt', 0, 100, LAB_to_HLC, HLC_to_LAB)}
          <span className='Spacer'> </span>
          {input('H', 'sld', -180, 180, LAB_to_HLC, HLC_to_LAB)}
          {input('H', 'txt', -180, 180, LAB_to_HLC, HLC_to_LAB)}
          <span className='Spacer'> </span>
          {input('C', 'sld', 0, 180, LAB_to_HLC, HLC_to_LAB)}
          {input('C', 'txt', 0, 180, LAB_to_HLC, HLC_to_LAB)}
        </div>
        <div className='ColorInputPreviewRow' >
          <input className='ParamInput' value={LAB_to_Hex(color)} onChange={onChangeHex} />
          {preview_boxes}
        </div>
      </div>
    );
  }
}
