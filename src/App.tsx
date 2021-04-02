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
          <Palette base={{ R: 0.9, G: 0.9, B: 0.9 }} color1={{ R: 0, G:  178.47 / 255, B: 1.0 }} n={500} />
      </div>
    )
  }
}

export default App;
