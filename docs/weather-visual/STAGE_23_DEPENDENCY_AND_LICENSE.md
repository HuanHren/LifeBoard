# Stage 23 Dependency and License

## Dependency

- Package: `pixi.js`
- Installed version: `8.19.0`
- Install command: `npm install --save-exact pixi.js@8.19.0`
- Verification: `npm ls pixi.js` reports `pixi.js@8.19.0`.

No `@pixi/react`, React adapter, Three.js, GSAP, Lottie, particle library, or CDN dependency was added.

## Official References

- PixiJS Application docs: `https://pixijs.com/8.x/guides/components/application`
- PixiJS v8 API docs for `Application.init`: `https://pixijs.download/dev/docs/app.Application.html`
- PixiJS v8 migration guide: `https://pixijs.com/8.x/guides/migrations/v8`
- Installed package TypeScript declarations: `node_modules/pixi.js/dist/pixi.js.d.ts`

The implementation uses the v8 async initialization shape:

```ts
const app = new Application()
await app.init(options)
```

## License

`pixi.js@8.19.0` declares `MIT` in its package metadata. The package license file identifies the MIT license and copyright holders:

`Copyright (c) 2013-2023 Mathew Groves, Chad Engler`

`THIRD_PARTY_NOTICES.md` records the dependency and license notice.

## Bundle Notes

PixiJS is reached through dynamic import from the weather Pixi layer. The main entry chunk stayed effectively unchanged from baseline:

- Baseline `index` JS gzip: `83.40 kB`
- Stage 23 `index` JS gzip: `83.38 kB`

Vite emitted PixiJS as async chunks, including a large `lib` chunk:

- `dist/assets/lib-BYSQcHbe.js`: `513.51 kB`, gzip `145.82 kB`

The weather page chunk increased because it now contains the Vue adapter and dynamic import boundary:

- Baseline `WeatherPage` JS gzip: `17.79 kB`
- Stage 23 `WeatherPage` JS gzip: `20.53 kB`
