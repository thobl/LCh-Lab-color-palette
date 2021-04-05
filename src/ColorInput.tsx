import React from 'react'
import { CIEDE2000, ColorLCh, Hex_to_HLC, HLC_to_LAB, HLC_to_Hex, LAB_to_HLC, HLC_to_CSS, Color } from './Color';

interface ColorInputProps {
  colors: Array<ColorLCh>;
  id: number;
  handler: (colors: Array<ColorLCh>) => void;
}

export default class ColorInput extends React.Component<ColorInputProps> {
  render(): JSX.Element {
    const id: number = this.props.id;
    // make shallow copies of the color array and of our color
    const colors: Array<ColorLCh> = [...this.props.colors];
    const color: ColorLCh = { ...colors[id] };

    // create an input (as text or slide) for a property of a color
    const input = <T extends Color>(
      prop: keyof T,
      inputType: 'txt' | 'sld',
      min: number, max: number,
      convFromHLC: (color: ColorLCh) => T,
      convToHLC: (col: T) => ColorLCh) => {

      // color in the desired format
      let col: T = convFromHLC(color);

      // change handler
      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let change: any = {};
        change[prop] = Math.min(max, Math.max(min, parseFloat(e.target.value)));
        const col_new = { ...col, ...change };
        colors[id] = convToHLC(col_new);
        this.props.handler(colors);
      }

      // html form
      if (inputType === 'txt') {
        return (<input className='ParamInput' type='text' value={Math.round(col[prop])} onChange={onChange} />);
      }
      return (<input className='Slider' type='range' min={min} max={max} value={col[prop]} onChange={onChange} />);
    };

    const identity = <T extends unknown>(inp: T): T => inp;

    const onChangeHex = (e: React.ChangeEvent<HTMLInputElement>) => {
      colors[id] = Hex_to_HLC(e.target.value);
      this.props.handler(colors);
    }

    const hexInput = <input className='hexInput' type='text' value={HLC_to_Hex(color)} onChange={onChangeHex} />

    let id2: number = 0;
    const preview_boxes = colors.map((color2: ColorLCh) => {
      const css_color1: string = HLC_to_CSS(color);
      const css_color2: string = HLC_to_CSS(color2);
      return (
        <div className='ColorInputPreviewBox' key={id2++} style={{ backgroundColor: css_color1, color: css_color2 }}>
          {CIEDE2000(HLC_to_LAB(color), HLC_to_LAB(color2)).toFixed(2)}
        </div>
      );
    });

    return (
      <div className='ColorInput'>
        <div className='ColorInputControls'>
          {input('L', 'sld', 0, 100, identity, identity)}
          {input('L', 'txt', 0, 100, identity, identity)}
          <span className='Spacer'> </span>
          {input('h', 'sld', -180, 180, identity, identity)}
          {input('h', 'txt', -180, 180, identity, identity)}
          <span className='Spacer'> </span>
          {input('C', 'sld', 0, 180, identity, identity)}
          {input('C', 'txt', 0, 180, identity, identity)}
        </div>
        <div className='ColorInputControls'>
          {input('L', 'sld', 0, 100, HLC_to_LAB, LAB_to_HLC)}
          {input('L', 'txt', 0, 100, HLC_to_LAB, LAB_to_HLC)}
          <span className='Spacer'> </span>
          {input('a', 'sld', -128, 127, HLC_to_LAB, LAB_to_HLC)}
          {input('a', 'txt', -128, 127, HLC_to_LAB, LAB_to_HLC)}
          <span className='Spacer'> </span>
          {input('b', 'sld', -128, 127, HLC_to_LAB, LAB_to_HLC)}
          {input('b', 'txt', -128, 127, HLC_to_LAB, LAB_to_HLC)}
        </div>
        <div className='ColorInputPreviewRow' >
          {hexInput}
          {preview_boxes}
        </div>
      </div>
    );
  }
}
