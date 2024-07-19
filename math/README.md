# RecMath Math module

## Getting started - in the browser

Load from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@rec-math/math@2"></script>
```

## Getting started - Node.js

Install the package with `npm i @rec-math/math` and import what you want.

```js
import * as math from '@rec-math/math';
```

## Usage

See the documentation at https://rec-math.com
for a full description of the API with examples.

Here is a quick demonstration of the nextAfter function which provides the next
larger (or smaller) floating point value.

```js
// In the browser.
const { nextAfter } = RecMath.math;
// In Node.js.
import { nextAfter } from '@rec-math/math';

// The smallest strictly positive floating point value.
console.log(nextAfter(0), Math.MIN_VALUE);

// Infinity
console.log(nextAfter(Math.MAX_VALUE));

// The largest floating point value.
console.log(nextAfter(Infinity, 0), Math.MAX_VALUE);
```

## Important information

RecMath is Copyright pbuk 2024 and is pulished under an MIT license. See
https://github.com/rec-math/rec-math for more information.
