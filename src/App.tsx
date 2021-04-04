import React from 'react';
// import { check_CIEDE2000, check_conversion } from './Color';
import Palette from './Palette'

class App extends React.Component {
  render(): JSX.Element {
    // testing the color distance
    // check_CIEDE2000();
    // check_conversion();
    return (
      <div>
        <Palette
          base={{ R: 0 / 255, G: 0 / 255, B: 0 / 255 }}
          color1={{ R: 255 / 255, G: 233 / 255, B: 112 / 255 }}
          n={16} />
      </div>
    )
  }
}

export default App;
