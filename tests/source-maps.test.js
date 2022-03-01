import { runWithSourceMaps as run, html, css } from './util/run'
import { parseSourceMaps } from './util/source-maps'

it('apply generates source maps', async () => {
  let config = {
    content: [
      {
        raw: html`
          <div class="with-declaration"></div>
          <div class="with-comment"></div>
          <div class="just-apply"></div>
        `,
      },
    ],
    corePlugins: { preflight: false },
  }

  let input = css`
    .with-declaration {
      background-color: red;
      @apply h-4 w-4 bg-green-500;
    }

    .with-comment {
      /* sourcemap will work here too */
      @apply h-4 w-4 bg-red-500;
    }

    .just-apply {
      @apply h-4 w-4 bg-black;
    }
  `

  let result = await run(input, config)
  let { sources, annotations } = parseSourceMaps(result)

  // All CSS generated by Tailwind CSS should be annotated with source maps
  // And always be able to point to the original source file
  expect(sources).not.toContain('<no source>')
  expect(sources.length).toBe(1)

  // It would make the tests nicer to read and write
  expect(annotations).toStrictEqual([
    '2:4 -> 2:4',
    '3:6-27 -> 3:6-27',
    '4:6-33 -> 4:6-18',
    '4:6-33 -> 5:6-17',
    '4:6-33 -> 6:6-24',
    '4:6-33 -> 7:6-61',
    '5:4 -> 8:4',
    '7:4 -> 10:4',
    '8:6-39 -> 11:6-39',
    '9:6-31 -> 12:6-18',
    '9:6-31 -> 13:6-17',
    '9:6-31 -> 14:6-24',
    '9:6-31 -> 15:6-61',
    '10:4 -> 16:4',
    '13:6 -> 18:4',
    '13:6-29 -> 19:6-18',
    '13:6-29 -> 20:6-17',
    '13:6-29 -> 21:6-24',
    '13:6 -> 22:6',
    '13:29 -> 23:0',
  ])
})

it('preflight + base have source maps', async () => {
  let config = {
    content: [],
  }

  let input = css`
    @tailwind base;
  `

  let result = await run(input, config)
  let { sources, annotations } = parseSourceMaps(result)

  // All CSS generated by Tailwind CSS should be annotated with source maps
  // And always be able to point to the original source file
  expect(sources).not.toContain('<no source>')
  expect(sources.length).toBe(1)

  // It would make the tests nicer to read and write
  expect(annotations).toStrictEqual([
    '2:4 -> 1:0',
    '2:18-4 -> 3:1-2',
    '2:18 -> 6:1',
    '2:4 -> 8:0',
    '2:4-18 -> 11:2-32',
    '2:4-18 -> 12:2-25',
    '2:4-18 -> 13:2-29',
    '2:4-18 -> 14:2-31',
    '2:18 -> 15:0',
    '2:4 -> 17:0',
    '2:4-18 -> 19:2-18',
    '2:18 -> 20:0',
    '2:4 -> 22:0',
    '2:18 -> 27:1',
    '2:4 -> 29:0',
    '2:4-18 -> 30:2-26',
    '2:4-18 -> 31:2-40',
    '2:4-18 -> 32:2-26',
    '2:4-18 -> 33:2-21',
    '2:4-18 -> 34:2-230',
    '2:18 -> 35:0',
    '2:4 -> 37:0',
    '2:18 -> 40:1',
    '2:4 -> 42:0',
    '2:4-18 -> 43:2-19',
    '2:4-18 -> 44:2-30',
    '2:18 -> 45:0',
    '2:4 -> 47:0',
    '2:18 -> 51:1',
    '2:4 -> 53:0',
    '2:4-18 -> 54:2-19',
    '2:4-18 -> 55:2-24',
    '2:4-18 -> 56:2-31',
    '2:18 -> 57:0',
    '2:4 -> 59:0',
    '2:18 -> 61:1',
    '2:4 -> 63:0',
    '2:4-18 -> 64:2-35',
    '2:18 -> 65:0',
    '2:4 -> 67:0',
    '2:18 -> 69:1',
    '2:4 -> 71:0',
    '2:4-18 -> 77:2-20',
    '2:4-18 -> 78:2-22',
    '2:18 -> 79:0',
    '2:4 -> 81:0',
    '2:18 -> 83:1',
    '2:4 -> 85:0',
    '2:4-18 -> 86:2-16',
    '2:4-18 -> 87:2-26',
    '2:18 -> 88:0',
    '2:4 -> 90:0',
    '2:18 -> 92:1',
    '2:4 -> 94:0',
    '2:4-18 -> 96:2-21',
    '2:18 -> 97:0',
    '2:4 -> 99:0',
    '2:18 -> 102:1',
    '2:4 -> 104:0',
    '2:4-18 -> 108:2-121',
    '2:4-18 -> 109:2-24',
    '2:18 -> 110:0',
    '2:4 -> 112:0',
    '2:18 -> 114:1',
    '2:4 -> 116:0',
    '2:4-18 -> 117:2-16',
    '2:18 -> 118:0',
    '2:4 -> 120:0',
    '2:18 -> 122:1',
    '2:4 -> 124:0',
    '2:4-18 -> 126:2-16',
    '2:4-18 -> 127:2-16',
    '2:4-18 -> 128:2-20',
    '2:4-18 -> 129:2-26',
    '2:18 -> 130:0',
    '2:4 -> 132:0',
    '2:4-18 -> 133:2-17',
    '2:18 -> 134:0',
    '2:4 -> 136:0',
    '2:4-18 -> 137:2-13',
    '2:18 -> 138:0',
    '2:4 -> 140:0',
    '2:18 -> 144:1',
    '2:4 -> 146:0',
    '2:4-18 -> 147:2-24',
    '2:4-18 -> 148:2-31',
    '2:4-18 -> 149:2-35',
    '2:18 -> 150:0',
    '2:4 -> 152:0',
    '2:18 -> 156:1',
    '2:4 -> 158:0',
    '2:4-18 -> 163:2-30',
    '2:4-18 -> 164:2-25',
    '2:4-18 -> 165:2-30',
    '2:4-18 -> 166:2-24',
    '2:4-18 -> 167:2-19',
    '2:4-18 -> 168:2-20',
    '2:18 -> 169:0',
    '2:4 -> 171:0',
    '2:18 -> 173:1',
    '2:4 -> 175:0',
    '2:4-18 -> 177:2-22',
    '2:18 -> 178:0',
    '2:4 -> 180:0',
    '2:18 -> 183:1',
    '2:4 -> 185:0',
    '2:4-18 -> 189:2-36',
    '2:4-18 -> 190:2-39',
    '2:4-18 -> 191:2-32',
    '2:18 -> 192:0',
    '2:4 -> 194:0',
    '2:18 -> 196:1',
    '2:4 -> 198:0',
    '2:4-18 -> 199:2-15',
    '2:18 -> 200:0',
    '2:4 -> 202:0',
    '2:18 -> 204:1',
    '2:4 -> 206:0',
    '2:4-18 -> 207:2-18',
    '2:18 -> 208:0',
    '2:4 -> 210:0',
    '2:18 -> 212:1',
    '2:4 -> 214:0',
    '2:4-18 -> 215:2-26',
    '2:18 -> 216:0',
    '2:4 -> 218:0',
    '2:18 -> 220:1',
    '2:4 -> 222:0',
    '2:4-18 -> 224:2-14',
    '2:18 -> 225:0',
    '2:4 -> 227:0',
    '2:18 -> 230:1',
    '2:4 -> 232:0',
    '2:4-18 -> 233:2-39',
    '2:4-18 -> 234:2-30',
    '2:18 -> 235:0',
    '2:4 -> 237:0',
    '2:18 -> 239:1',
    '2:4 -> 241:0',
    '2:4-18 -> 242:2-26',
    '2:18 -> 243:0',
    '2:4 -> 245:0',
    '2:18 -> 248:1',
    '2:4 -> 250:0',
    '2:4-18 -> 251:2-36',
    '2:4-18 -> 252:2-23',
    '2:18 -> 253:0',
    '2:4 -> 255:0',
    '2:18 -> 257:1',
    '2:4 -> 259:0',
    '2:4-18 -> 260:2-20',
    '2:18 -> 261:0',
    '2:4 -> 263:0',
    '2:18 -> 265:1',
    '2:4 -> 267:0',
    '2:4-18 -> 280:2-11',
    '2:18 -> 281:0',
    '2:4 -> 283:0',
    '2:4-18 -> 284:2-11',
    '2:4-18 -> 285:2-12',
    '2:18 -> 286:0',
    '2:4 -> 288:0',
    '2:4-18 -> 289:2-12',
    '2:18 -> 290:0',
    '2:4 -> 292:0',
    '2:4-18 -> 295:2-18',
    '2:4-18 -> 296:2-11',
    '2:4-18 -> 297:2-12',
    '2:18 -> 298:0',
    '2:4 -> 300:0',
    '2:18 -> 302:1',
    '2:4 -> 304:0',
    '2:4-18 -> 305:2-18',
    '2:18 -> 306:0',
    '2:4 -> 308:0',
    '2:18 -> 311:1',
    '2:4 -> 313:0',
    '2:4-18 -> 315:2-20',
    '2:4-18 -> 316:2-24',
    '2:18 -> 317:0',
    '2:4 -> 319:0',
    '2:18 -> 321:1',
    '2:4 -> 323:0',
    '2:4-18 -> 325:2-17',
    '2:18 -> 326:0',
    '2:4 -> 328:0',
    '2:18 -> 330:1',
    '2:4 -> 331:0',
    '2:4-18 -> 332:2-17',
    '2:18 -> 333:0',
    '2:4 -> 335:0',
    '2:18 -> 339:1',
    '2:4 -> 341:0',
    '2:4-18 -> 349:2-24',
    '2:4-18 -> 350:2-32',
    '2:18 -> 351:0',
    '2:4 -> 353:0',
    '2:18 -> 355:1',
    '2:4 -> 357:0',
    '2:4-18 -> 359:2-17',
    '2:4-18 -> 360:2-14',
    '2:18 -> 361:0',
    '2:4 -> 363:0',
    '2:18 -> 365:1',
    '2:4 -> 367:0',
    '2:4-18 -> 368:2-15',
    '2:18 -> 369:0',
    '2:4 -> 371:0',
    '2:4-18 -> 372:2-21',
    '2:4-18 -> 373:2-21',
    '2:4-18 -> 374:2-16',
    '2:4-18 -> 375:2-16',
    '2:4-18 -> 376:2-16',
    '2:4-18 -> 377:2-17',
    '2:4-18 -> 378:2-17',
    '2:4-18 -> 379:2-15',
    '2:4-18 -> 380:2-15',
    '2:4-18 -> 381:2-20',
    '2:4-18 -> 382:2-40',
    '2:4-18 -> 383:2-17',
    '2:4-18 -> 384:2-22',
    '2:4-18 -> 385:2-24',
    '2:4-18 -> 386:2-25',
    '2:4-18 -> 387:2-26',
    '2:4-18 -> 388:2-20',
    '2:4-18 -> 389:2-29',
    '2:4-18 -> 390:2-30',
    '2:4-18 -> 391:2-40',
    '2:4-18 -> 392:2-36',
    '2:4-18 -> 393:2-29',
    '2:4-18 -> 394:2-24',
    '2:4-18 -> 395:2-32',
    '2:4-18 -> 396:2-14',
    '2:4-18 -> 397:2-20',
    '2:4-18 -> 398:2-18',
    '2:4-18 -> 399:2-19',
    '2:4-18 -> 400:2-20',
    '2:4-18 -> 401:2-16',
    '2:4-18 -> 402:2-18',
    '2:4-18 -> 403:2-15',
    '2:4-18 -> 404:2-21',
    '2:4-18 -> 405:2-23',
    '2:4-18 -> 406:2-29',
    '2:4-18 -> 407:2-27',
    '2:4-18 -> 408:2-28',
    '2:4-18 -> 409:2-29',
    '2:4-18 -> 410:2-25',
    '2:4-18 -> 411:2-26',
    '2:4-18 -> 412:2-27',
    '2:4 -> 413:2',
    '2:18 -> 414:0',
  ])
})

it('utilities have source maps', async () => {
  let config = {
    content: [{ raw: `text-red-500` }],
  }

  let input = css`
    @tailwind utilities;
  `

  let result = await run(input, config)
  let { sources, annotations } = parseSourceMaps(result)

  // All CSS generated by Tailwind CSS should be annotated with source maps
  // And always be able to point to the original source file
  expect(sources).not.toContain('<no source>')
  expect(sources.length).toBe(1)

  // It would make the tests nicer to read and write
  expect(annotations).toStrictEqual(['2:4 -> 1:0', '2:4-23 -> 2:4-24', '2:4 -> 3:4', '2:23 -> 4:0'])
})

it('components have source maps', async () => {
  let config = {
    content: [{ raw: `container` }],
  }

  let input = css`
    @tailwind components;
  `

  let result = await run(input, config)
  let { sources, annotations } = parseSourceMaps(result)

  // All CSS generated by Tailwind CSS should be annotated with source maps
  // And always be able to point to the original source file
  expect(sources).not.toContain('<no source>')
  expect(sources.length).toBe(1)

  // It would make the tests nicer to read and write
  expect(annotations).toStrictEqual([
    '2:4 -> 1:0',
    '2:4 -> 2:4',
    '2:24 -> 3:0',
    '2:4 -> 4:0',
    '2:4 -> 5:4',
    '2:4 -> 6:8',
    '2:24 -> 7:4',
    '2:24 -> 8:0',
    '2:4 -> 9:0',
    '2:4 -> 10:4',
    '2:4 -> 11:8',
    '2:24 -> 12:4',
    '2:24 -> 13:0',
    '2:4 -> 14:0',
    '2:4 -> 15:4',
    '2:4 -> 16:8',
    '2:24 -> 17:4',
    '2:24 -> 18:0',
    '2:4 -> 19:0',
    '2:4 -> 20:4',
    '2:4 -> 21:8',
    '2:24 -> 22:4',
    '2:24 -> 23:0',
    '2:4 -> 24:0',
    '2:4 -> 25:4',
    '2:4 -> 26:8',
    '2:24 -> 27:4',
    '2:24 -> 28:0',
  ])
})
