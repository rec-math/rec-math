# RecMath Integration module

## Getting started - in the browser

Load from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@rec-math/integrate@2"></script>
```

## Getting started - Node.js

Install the package with `npm i @rec-math/integrate` and import.

```js
import * as integrate from '@rec-math/integrate';
```

## Usage

See the documentation at https://rec-math.com
for a full description of the API with examples.

Here is a quick demonstration of the `solveIvp` function.

```js
// In the browser.
const { solveIvp } = RecMath.integrate;
// In Node.js.
import { solveIvp } from '@rec-math/integrate';

// The exponential function.
const f = (t, x, dxdt) => {
    dxdt[0] = Math.exp(t);
  };
const range = [0, 1];
const y0: [1];
const options: { fixedStep: 1 / 2000 }

solveIvp(f, range, y0, options);

console.log(y0);
```

## Important information

RecMath is Copyright pbuk 2024 and is pulished under an MIT license. See
https://github.com/rec-math/rec-math for more information.
