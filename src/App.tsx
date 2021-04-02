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
          <Palette base={{ R: 0.9, G: 0.9, B: 0.9 }} color1={{ R: 0.9, G: 0.1, B: 0.1 }} n={8} />
      </div>
    )
  }
}

export default App;
