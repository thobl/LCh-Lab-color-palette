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
          <Palette base={{ R: 0.9, G: 0.9, B: 0.9 }} color1={{ R: 0.8, G: 0.3, B: 0.3 }} n={6} />
      </div>
    )
  }
}

export default App;
