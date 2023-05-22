import postcss from 'postcss'
import { parseSourceMaps } from './util/source-maps'
import { crosscheck, runWithSourceMaps as run, html, css, map } from './util/run'

crosscheck(({ stable, oxide }) => {
  oxide.test.todo('apply generates source maps')
  stable.test.skip('apply generates source maps', async () => {
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

    expect(annotations).toEqual([
      '2:6 -> 2:6',
      '3:8-29 -> 3:8-29',
      '4:8-35 -> 4:8-20',
      '4:8-35 -> 5:8-19',
      '4:8-35 -> 6:8-26',
      '4:8-35 -> 7:8-63',
      '5:6 -> 8:6',
      '7:6 -> 10:6',
      '8:8-41 -> 11:8-41',
      '9:8-33 -> 12:8-20',
      '9:8-33 -> 13:8-19',
      '9:8-33 -> 14:8-26',
      '9:8-33 -> 15:8-63',
      '10:6 -> 16:6',
      '13:8 -> 18:6',
      '13:8-31 -> 19:8-20',
      '13:8-31 -> 20:8-19',
      '13:8-31 -> 21:8-26',
      '13:8 -> 22:8',
      '13:31 -> 23:0',
    ])
  })

  oxide.test.todo('preflight + base have source maps')
  stable.test.skip('preflight + base have source maps', async () => {
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

    expect(annotations).toEqual([
      '2:6 -> 1:0',
      '2:20-6 -> 3:1-2',
      '2:20 -> 6:1',
      '2:6 -> 8:0',
      '2:6-20 -> 11:2-32',
      '2:6-20 -> 12:2-25',
      '2:6-20 -> 13:2-29',
      '2:6-20 -> 14:2-31',
      '2:20 -> 15:0',
      '2:6 -> 17:0',
      '2:6-20 -> 19:2-18',
      '2:20 -> 20:0',
      '2:6 -> 22:0',
      '2:20 -> 29:1',
      '2:6 -> 31:0',
      '2:6-20 -> 32:2-26',
      '2:6-20 -> 33:2-40',
      '2:6-20 -> 34:2-26',
      '2:6-20 -> 35:2-21',
      '2:6-20 -> 36:2-230',
      '2:6-20 -> 37:2-39',
      '2:6-20 -> 38:2-41',
      '2:20 -> 39:0',
      '2:6 -> 41:0',
      '2:20 -> 44:1',
      '2:6 -> 46:0',
      '2:6-20 -> 47:2-19',
      '2:6-20 -> 48:2-30',
      '2:20 -> 49:0',
      '2:6 -> 51:0',
      '2:20 -> 55:1',
      '2:6 -> 57:0',
      '2:6-20 -> 58:2-19',
      '2:6-20 -> 59:2-24',
      '2:6-20 -> 60:2-31',
      '2:20 -> 61:0',
      '2:6 -> 63:0',
      '2:20 -> 65:1',
      '2:6 -> 67:0',
      '2:6-20 -> 68:2-35',
      '2:20 -> 69:0',
      '2:6 -> 71:0',
      '2:20 -> 73:1',
      '2:6 -> 75:0',
      '2:6-20 -> 81:2-20',
      '2:6-20 -> 82:2-22',
      '2:20 -> 83:0',
      '2:6 -> 85:0',
      '2:20 -> 87:1',
      '2:6 -> 89:0',
      '2:6-20 -> 90:2-16',
      '2:6-20 -> 91:2-26',
      '2:20 -> 92:0',
      '2:6 -> 94:0',
      '2:20 -> 96:1',
      '2:6 -> 98:0',
      '2:6-20 -> 100:2-21',
      '2:20 -> 101:0',
      '2:6 -> 103:0',
      '2:20 -> 106:1',
      '2:6 -> 108:0',
      '2:6-20 -> 112:2-121',
      '2:6-20 -> 113:2-24',
      '2:20 -> 114:0',
      '2:6 -> 116:0',
      '2:20 -> 118:1',
      '2:6 -> 120:0',
      '2:6-20 -> 121:2-16',
      '2:20 -> 122:0',
      '2:6 -> 124:0',
      '2:20 -> 126:1',
      '2:6 -> 128:0',
      '2:6-20 -> 130:2-16',
      '2:6-20 -> 131:2-16',
      '2:6-20 -> 132:2-20',
      '2:6-20 -> 133:2-26',
      '2:20 -> 134:0',
      '2:6 -> 136:0',
      '2:6-20 -> 137:2-17',
      '2:20 -> 138:0',
      '2:6 -> 140:0',
      '2:6-20 -> 141:2-13',
      '2:20 -> 142:0',
      '2:6 -> 144:0',
      '2:20 -> 148:1',
      '2:6 -> 150:0',
      '2:6-20 -> 151:2-24',
      '2:6-20 -> 152:2-31',
      '2:6-20 -> 153:2-35',
      '2:20 -> 154:0',
      '2:6 -> 156:0',
      '2:20 -> 160:1',
      '2:6 -> 162:0',
      '2:6-20 -> 167:2-30',
      '2:6-20 -> 168:2-40',
      '2:6-20 -> 169:2-42',
      '2:6-20 -> 170:2-25',
      '2:6-20 -> 171:2-30',
      '2:6-20 -> 172:2-30',
      '2:6-20 -> 173:2-24',
      '2:6-20 -> 174:2-19',
      '2:6-20 -> 175:2-20',
      '2:20 -> 176:0',
      '2:6 -> 178:0',
      '2:20 -> 180:1',
      '2:6 -> 182:0',
      '2:6-20 -> 184:2-22',
      '2:20 -> 185:0',
      '2:6 -> 187:0',
      '2:20 -> 190:1',
      '2:6 -> 192:0',
      '2:6-20 -> 196:2-36',
      '2:6-20 -> 197:2-39',
      '2:6-20 -> 198:2-32',
      '2:20 -> 199:0',
      '2:6 -> 201:0',
      '2:20 -> 203:1',
      '2:6 -> 205:0',
      '2:6-20 -> 206:2-15',
      '2:20 -> 207:0',
      '2:6 -> 209:0',
      '2:20 -> 211:1',
      '2:6 -> 213:0',
      '2:6-20 -> 214:2-18',
      '2:20 -> 215:0',
      '2:6 -> 217:0',
      '2:20 -> 219:1',
      '2:6 -> 221:0',
      '2:6-20 -> 222:2-26',
      '2:20 -> 223:0',
      '2:6 -> 225:0',
      '2:20 -> 227:1',
      '2:6 -> 229:0',
      '2:6-20 -> 231:2-14',
      '2:20 -> 232:0',
      '2:6 -> 234:0',
      '2:20 -> 237:1',
      '2:6 -> 239:0',
      '2:6-20 -> 240:2-39',
      '2:6-20 -> 241:2-30',
      '2:20 -> 242:0',
      '2:6 -> 244:0',
      '2:20 -> 246:1',
      '2:6 -> 248:0',
      '2:6-20 -> 249:2-26',
      '2:20 -> 250:0',
      '2:6 -> 252:0',
      '2:20 -> 255:1',
      '2:6 -> 257:0',
      '2:6-20 -> 258:2-36',
      '2:6-20 -> 259:2-23',
      '2:20 -> 260:0',
      '2:6 -> 262:0',
      '2:20 -> 264:1',
      '2:6 -> 266:0',
      '2:6-20 -> 267:2-20',
      '2:20 -> 268:0',
      '2:6 -> 270:0',
      '2:20 -> 272:1',
      '2:6 -> 274:0',
      '2:6-20 -> 287:2-11',
      '2:20 -> 288:0',
      '2:6 -> 290:0',
      '2:6-20 -> 291:2-11',
      '2:6-20 -> 292:2-12',
      '2:20 -> 293:0',
      '2:6 -> 295:0',
      '2:6-20 -> 296:2-12',
      '2:20 -> 297:0',
      '2:6 -> 299:0',
      '2:6-20 -> 302:2-18',
      '2:6-20 -> 303:2-11',
      '2:6-20 -> 304:2-12',
      '2:20 -> 305:0',
      '2:6 -> 307:0',
      '2:6-20 -> 308:2-12',
      '2:20 -> 309:0',
      '2:6 -> 311:0',
      '2:20 -> 313:1',
      '2:6 -> 315:0',
      '2:6-20 -> 316:2-18',
      '2:20 -> 317:0',
      '2:6 -> 319:0',
      '2:20 -> 322:1',
      '2:6 -> 324:0',
      '2:6-20 -> 326:2-20',
      '2:6-20 -> 327:2-24',
      '2:20 -> 328:0',
      '2:6 -> 330:0',
      '2:20 -> 332:1',
      '2:6 -> 334:0',
      '2:6-20 -> 336:2-17',
      '2:20 -> 337:0',
      '2:6 -> 339:0',
      '2:20 -> 341:1',
      '2:6 -> 342:0',
      '2:6-20 -> 343:2-17',
      '2:20 -> 344:0',
      '2:6 -> 346:0',
      '2:20 -> 350:1',
      '2:6 -> 352:0',
      '2:6-20 -> 360:2-24',
      '2:6-20 -> 361:2-32',
      '2:20 -> 362:0',
      '2:6 -> 364:0',
      '2:20 -> 366:1',
      '2:6 -> 368:0',
      '2:6-20 -> 370:2-17',
      '2:6-20 -> 371:2-14',
      '2:20 -> 372:0',
      '2:6-20 -> 374:0-72',
      '2:6 -> 375:0',
      '2:6-20 -> 376:2-15',
      '2:20 -> 377:0',
      '2:6 -> 379:0',
      '2:6-20 -> 380:2-26',
      '2:6-20 -> 381:2-26',
      '2:6-20 -> 382:2-21',
      '2:6-20 -> 383:2-21',
      '2:6-20 -> 384:2-16',
      '2:6-20 -> 385:2-16',
      '2:6-20 -> 386:2-16',
      '2:6-20 -> 387:2-17',
      '2:6-20 -> 388:2-17',
      '2:6-20 -> 389:2-15',
      '2:6-20 -> 390:2-15',
      '2:6-20 -> 391:2-20',
      '2:6-20 -> 392:2-40',
      '2:6-20 -> 393:2-32',
      '2:6-20 -> 394:2-31',
      '2:6-20 -> 395:2-30',
      '2:6-20 -> 396:2-17',
      '2:6-20 -> 397:2-22',
      '2:6-20 -> 398:2-24',
      '2:6-20 -> 399:2-25',
      '2:6-20 -> 400:2-26',
      '2:6-20 -> 401:2-20',
      '2:6-20 -> 402:2-29',
      '2:6-20 -> 403:2-30',
      '2:6-20 -> 404:2-40',
      '2:6-20 -> 405:2-36',
      '2:6-20 -> 406:2-29',
      '2:6-20 -> 407:2-24',
      '2:6-20 -> 408:2-32',
      '2:6-20 -> 409:2-14',
      '2:6-20 -> 410:2-20',
      '2:6-20 -> 411:2-18',
      '2:6-20 -> 412:2-19',
      '2:6-20 -> 413:2-20',
      '2:6-20 -> 414:2-16',
      '2:6-20 -> 415:2-18',
      '2:6-20 -> 416:2-15',
      '2:6-20 -> 417:2-21',
      '2:6-20 -> 418:2-23',
      '2:6-20 -> 419:2-29',
      '2:6-20 -> 420:2-27',
      '2:6-20 -> 421:2-28',
      '2:6-20 -> 422:2-29',
      '2:6-20 -> 423:2-25',
      '2:6-20 -> 424:2-26',
      '2:6-20 -> 425:2-27',
      '2:6 -> 426:2',
      '2:20 -> 427:0',
      '2:6 -> 429:0',
      '2:6-20 -> 430:2-26',
      '2:6-20 -> 431:2-26',
      '2:6-20 -> 432:2-21',
      '2:6-20 -> 433:2-21',
      '2:6-20 -> 434:2-16',
      '2:6-20 -> 435:2-16',
      '2:6-20 -> 436:2-16',
      '2:6-20 -> 437:2-17',
      '2:6-20 -> 438:2-17',
      '2:6-20 -> 439:2-15',
      '2:6-20 -> 440:2-15',
      '2:6-20 -> 441:2-20',
      '2:6-20 -> 442:2-40',
      '2:6-20 -> 443:2-32',
      '2:6-20 -> 444:2-31',
      '2:6-20 -> 445:2-30',
      '2:6-20 -> 446:2-17',
      '2:6-20 -> 447:2-22',
      '2:6-20 -> 448:2-24',
      '2:6-20 -> 449:2-25',
      '2:6-20 -> 450:2-26',
      '2:6-20 -> 451:2-20',
      '2:6-20 -> 452:2-29',
      '2:6-20 -> 453:2-30',
      '2:6-20 -> 454:2-40',
      '2:6-20 -> 455:2-36',
      '2:6-20 -> 456:2-29',
      '2:6-20 -> 457:2-24',
      '2:6-20 -> 458:2-32',
      '2:6-20 -> 459:2-14',
      '2:6-20 -> 460:2-20',
      '2:6-20 -> 461:2-18',
      '2:6-20 -> 462:2-19',
      '2:6-20 -> 463:2-20',
      '2:6-20 -> 464:2-16',
      '2:6-20 -> 465:2-18',
      '2:6-20 -> 466:2-15',
      '2:6-20 -> 467:2-21',
      '2:6-20 -> 468:2-23',
      '2:6-20 -> 469:2-29',
      '2:6-20 -> 470:2-27',
      '2:6-20 -> 471:2-28',
      '2:6-20 -> 472:2-29',
      '2:6-20 -> 473:2-25',
      '2:6-20 -> 474:2-26',
      '2:6-20 -> 475:2-27',
      '2:6 -> 476:2',
      '2:20 -> 477:0',
    ])
  })

  oxide.test.todo('utilities have source maps')
  stable.test.skip('utilities have source maps', async () => {
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

    expect(annotations).toStrictEqual([
      '2:6 -> 1:0',
      '2:6-25 -> 2:4-24',
      '2:6 -> 3:4',
      '2:25 -> 4:0',
    ])
  })

  oxide.test.todo('components have source maps')
  stable.test.skip('components have source maps', async () => {
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

    expect(annotations).toEqual([
      '2:6 -> 1:0',
      '2:6 -> 2:4',
      '2:26 -> 3:0',
      '2:6 -> 4:0',
      '2:6 -> 5:4',
      '2:6 -> 6:8',
      '2:26 -> 7:4',
      '2:26 -> 8:0',
      '2:6 -> 9:0',
      '2:6 -> 10:4',
      '2:6 -> 11:8',
      '2:26 -> 12:4',
      '2:26 -> 13:0',
      '2:6 -> 14:0',
      '2:6 -> 15:4',
      '2:6 -> 16:8',
      '2:26 -> 17:4',
      '2:26 -> 18:0',
      '2:6 -> 19:0',
      '2:6 -> 20:4',
      '2:6 -> 21:8',
      '2:26 -> 22:4',
      '2:26 -> 23:0',
      '2:6 -> 24:0',
      '2:6 -> 25:4',
      '2:6 -> 26:8',
      '2:26 -> 27:4',
      '2:26 -> 28:0',
    ])
  })

  oxide.test.todo('source maps for layer rules are not rewritten to point to @tailwind directives')
  stable.test.skip(
    'source maps for layer rules are not rewritten to point to @tailwind directives',
    async () => {
      let config = {
        content: [{ raw: `font-normal foo hover:foo` }],
      }

      let utilitiesFile = postcss.parse(
        css`
          @tailwind utilities;
        `,
        { from: 'components.css', map: { prev: map } }
      )

      let mainCssFile = postcss.parse(
        css`
          @layer utilities {
            .foo {
              background-color: red;
            }
          }
        `,
        { from: 'input.css', map: { prev: map } }
      )

      // Just pretend that there's an @import in `mainCssFile` that imports the nodes from `utilitiesFile`
      let input = postcss.root({
        nodes: [...utilitiesFile.nodes, ...mainCssFile.nodes],
        source: mainCssFile.source,
      })

      let result = await run(input, config)

      let { sources, annotations } = parseSourceMaps(result)

      // All CSS generated by Tailwind CSS should be annotated with source maps
      // And always be able to point to the original source file
      expect(sources).not.toContain('<no source>')

      // And we should see that the source map for the layer rule is not rewritten
      // to point to the @tailwind directive but instead points to the original
      expect(sources.length).toBe(2)
      expect(sources).toEqual(['components.css', 'input.css'])

      expect(annotations).toEqual([
        '2:10 -> 1:0',
        '2:10 -> 2:14',
        '2:29 -> 3:0',
        '3:12 -> 4:12',
        '4:14-35 -> 5:14-35',
        '5:12 -> 6:12',
        '3:12 -> 7:12',
        '4:14-35 -> 8:14-35',
        '5:12 -> 9:12',
      ])
    }
  )
})
