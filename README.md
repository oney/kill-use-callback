# kill-use-callback

[![npm](https://img.shields.io/npm/v/kill-use-callback?style=flat-square)](https://www.npmjs.com/package/kill-use-callback)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/kill-use-callback?style=flat-square)](https://bundlephobia.com/result?p=kill-use-callback)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/oney/kill-use-callback/blob/master/src/index.tsx)
[![GitHub](https://img.shields.io/github/license/oney/kill-use-callback?style=flat-square)](https://github.com/oney/kill-use-callback/blob/master/LICENSE)

This package provides memorized callbacks (like `useCallback`) for any callbacks like it's inline or in a condition or loop.

Please ⭐ star this repo if it's useful!

```jsx
import React from "react";
import { propsAreEqual, depFn, useEffect } from "./kill-use-callback";

const Child = React.memo(
  ({ getText }) => <div>{getText()}</div>,
  propsAreEqual
);

export default function App({items}) {
  const [text, setText] = React.useState("a");
  const [text2, setText2] = React.useState("b");

  const getText = text.length === 10
    ? undefined
    : depFn((prefix) => `${prefix}: ${text}`, [text]);
  useEffect(() => {
    console.log(getText?.("Effect"));
  }, [getText]);

  return (
    <div>
      {items.map(item => (
        <Child getText={depFn(() => `${item}: ${text}`, [text])} />
      ))}
    </div>
  );
}
```

When `text2` changes, `Child` won't re-render and the effect won't re-trigger.  
And `text` changes, `Child` will re-render and the effect will re-trigger.

## depFn
The usage of `depFn` is just like `useCallback`. Wrap your callback function and list all dependencies in the 2nd parameter.

## Demo
Please check [this codesandbox example](https://codesandbox.io/s/kill-usecallback-k82teg?file=/src/App.tsx:0-1870).

# Explanation

`depFn` is not a React hook that needs to depend on React lifecycle, so `depFn` can be used anywhere like in a condition or in a loop.

If two closures have the same "function body code", and the same "environment" (or context) which actually means the dependency of values or references, these two closures can be considered as equal.

This concept is how `depFn` works. Just check the source code of this package. It's easy to understand.
