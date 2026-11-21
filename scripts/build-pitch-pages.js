import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { layout } from '../src/desk-view.js'

const output = process.argv[2]
if (!output) throw new Error('Indica el directorio de salida.')

const shell = layout('Demo', '<noscript>Activa JavaScript para abrir Gradus.</noscript>', {
  pathname: '/pitch', courseNavigation: '<aside class="leaf overview course-nav"></aside>',
}).replace('href="/estilos.css"', 'href="./estilos.css"')
  .replace('href="/"', 'href="./"')
  .replace('</head>', '<script type="module" src="./pitch-pages.js"></script>\n</head>')

await mkdir(output, { recursive: true })
const assets = ['pitch.js', 'pitch-course.js', 'study-mastery.js', 'views.js', 'assessment.js', 'content.js']
await Promise.all([
  ...assets.map(name => copyFile(new URL(`../src/${name}`, import.meta.url), join(output, name))),
  copyFile(new URL('../src/style.css', import.meta.url), join(output, 'estilos.css')),
  copyFile(new URL('./pitch-pages.js', import.meta.url), join(output, 'pitch-pages.js')),
  writeFile(join(output, 'index.html'), shell),
])
