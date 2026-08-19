/**
 * Generates posts.js for each menu section from CINIYAANA_Content + public/menus images.
 * Run: node scripts/generate-section-posts.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const EN_ROOT = path.join(ROOT, 'CINIYAANA_Content', '02_ENGLISH')
const KN_ROOT = path.join(ROOT, 'CINIYAANA_Content', '01_KANNADA')

function findChild(dir, prefix) {
  const names = fs.readdirSync(dir)
  const hit = names.find((n) => n.startsWith(prefix))
  if (!hit) throw new Error(`No folder starting with "${prefix}" in ${dir}`)
  return path.join(dir, hit)
}

function readTxt(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
}

function parseArticle(raw) {
  const lines = raw.split(/\r?\n/)
  let title = ''
  const bodyLines = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!title) {
      if (!trimmed || /^-+$/.test(trimmed)) continue
      title = trimmed
      continue
    }
    if (/^-+$/.test(trimmed)) {
      bodyLines.push('')
      continue
    }
    bodyLines.push(line)
  }
  const body = bodyLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return { title, body }
}

function loadPair(enDir, knDir, num) {
  const enFile = path.join(enDir, String(num).padStart(2, '0'), `${String(num).padStart(2, '0')}.txt`)
  const knFile = path.join(knDir, String(num).padStart(2, '0'), `${String(num).padStart(2, '0')}.txt`)
  const en = parseArticle(readTxt(enFile))
  const kn = parseArticle(readTxt(knFile))
  return { en, kn }
}

function esc(str) {
  return String(str ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${')
    .replace(/'/g, "\\'")
}

function postHelpers(exportName, postsName) {
  return `
export function get${exportName}PostBySlug(slug) {
  return ${postsName}.find((post) => post.slug === slug) ?? null
}

export function get${exportName}Adjacent(slug) {
  const index = ${postsName}.findIndex((post) => post.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: index > 0 ? ${postsName}[index - 1] : null,
    next: index < ${postsName}.length - 1 ? ${postsName}[index + 1] : null,
  }
}

export function get${exportName}Related(slug, limit = 4) {
  return ${postsName}.filter((post) => post.slug !== slug).slice(0, limit)
}
`
}

function serializePost(post) {
  const lines = []
  lines.push('  {')
  lines.push(`    id: '${post.id}',`)
  lines.push(`    slug: '${post.slug}',`)
  lines.push(`    image: '${post.image}',`)
  lines.push(`    date: '${post.date ?? ''}',`)
  lines.push('    category: {')
  lines.push(`      kn: '${esc(post.category.kn)}',`)
  lines.push(`      en: '${esc(post.category.en)}',`)
  lines.push('    },')
  if (post.subtitle) {
    lines.push('    subtitle: {')
    lines.push(`      kn: '${esc(post.subtitle.kn)}',`)
    lines.push(`      en: '${esc(post.subtitle.en)}',`)
    lines.push('    },')
  }
  lines.push('    title: {')
  lines.push(`      kn: '${esc(post.title.kn)}',`)
  lines.push(`      en: '${esc(post.title.en)}',`)
  lines.push('    },')
  lines.push('    body: {')
  lines.push(`      kn: \`${esc(post.body.kn)}\`,`)
  lines.push(`      en: \`${esc(post.body.en)}\`,`)
  lines.push('    },')
  if (post.gallery?.length) {
    lines.push('    gallery: [')
    for (const g of post.gallery) {
      lines.push('      {')
      lines.push(`        src: '${g.src}',`)
      lines.push('        caption: {')
      lines.push(`          kn: '${esc(g.caption?.kn ?? '')}',`)
      lines.push(`          en: '${esc(g.caption?.en ?? '')}',`)
      lines.push('        },')
      lines.push('      },')
    }
    lines.push('    ],')
  }
  if (post.photoCredit) {
    lines.push('    photoCredit: {')
    lines.push(`      kn: '${esc(post.photoCredit.kn)}',`)
    lines.push(`      en: '${esc(post.photoCredit.en)}',`)
    lines.push('    },')
  }
  if (post.courtesy) {
    lines.push('    courtesy: {')
    lines.push(`      kn: '${esc(post.courtesy.kn)}',`)
    lines.push(`      en: '${esc(post.courtesy.en)}',`)
    lines.push('    },')
  }
  if (post.layout) {
    lines.push(`    layout: '${post.layout}',`)
  }
  if (post.galleryMode) {
    lines.push(`    galleryMode: '${post.galleryMode}',`)
  }
  lines.push('  },')
  return lines.join('\n')
}

function writePostsFile({ outPath, comment, postsName, helperName, posts }) {
  const content = `/**
 * ${comment}
 * Auto-generated from CINIYAANA_Content — re-run: node scripts/generate-section-posts.mjs
 */
export const ${postsName} = [
${posts.map(serializePost).join('\n')}
]
${postHelpers(helperName, postsName)}
`
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, content, 'utf8')
  console.log('Wrote', path.relative(ROOT, outPath), `(${posts.length} posts)`)
}

const CAT = {
  cinema: { kn: 'ಕನ್ನಡ ಸಿನಿಮಾ', en: 'Kannada Cinema' },
}

// --- INFO SPECIAL ---
{
  const enDir = findChild(EN_ROOT, '03_')
  const knDir = findChild(KN_ROOT, '03_')
  const p1 = loadPair(enDir, knDir, 1)
  const p2 = loadPair(enDir, knDir, 2)
  writePostsFile({
    outPath: path.join(ROOT, 'src/pages/info-special/posts.js'),
    comment: 'Info Special posts registry.',
    postsName: 'infoSpecialPosts',
    helperName: 'InfoSpecial',
    posts: [
      {
        id: '01',
        slug: 'chamundeshwari-studio',
        image: '/menus/infospecial/images/Studio_01.jpg',
        category: CAT.cinema,
        title: { kn: p1.kn.title, en: p1.en.title },
        body: { kn: p1.kn.body, en: p1.en.body },
        layout: 'banner',
        galleryMode: 'carousel',
        gallery: [
          {
            src: '/menus/infospecial/images/Studio_01.jpg',
            caption: {
              kn: 'ಚಾಮುಂಡೇಶ್ವರಿ ಸ್ಟುಡಿಯೋ — ಉಪಾಸನೆ ಚಿತ್ರ ವೀಕ್ಷಣೆಗೆ ದೇವರಾಜ ಅರಸು ಭೇಟಿ.',
              en: 'Former CM Devaraj Urs visiting Chamundeshwari Studio for Upasane.',
            },
          },
          {
            src: '/menus/infospecial/images/Studio_02.jpg',
            caption: {
              kn: 'ಬೆಟ್ಟದ ಕಳ್ಳ (1957) ಚಿತ್ರತಂಡ.',
              en: 'Cast and crew of Bettada Kalla (1957).',
            },
          },
        ],
        photoCredit: {
          kn: 'ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ',
          en: 'Pragathi Ashwathanarayana',
        },
      },
      {
        id: '02',
        slug: 'rajkumar-jayanthi-36-films',
        image: '/menus/infospecial/images/Raj - Jayanthi.jpg',
        category: CAT.cinema,
        title: { kn: p2.kn.title, en: p2.en.title },
        body: { kn: p2.kn.body, en: p2.en.body },
        gallery: [
          {
            src: '/menus/infospecial/images/Raj - Jayanthi.jpg',
            caption: { kn: 'ರಾಜ್ - ಜಯಂತಿ', en: 'Rajkumar – Jayanthi' },
          },
          {
            src: '/menus/infospecial/images/Raj - Leelavathi.jpg',
            caption: { kn: 'ರಾಜ್ - ಲೀಲಾವತಿ', en: 'Rajkumar – Leelavathi' },
          },
          {
            src: '/menus/infospecial/images/Raj - Bharathi.jpg',
            caption: { kn: 'ರಾಜ್ - ಭಾರತಿ', en: 'Rajkumar – Bharathi' },
          },
        ],
        courtesy: {
          kn: 'ಡಾ.ಕೆ.ಪುಟ್ಟಸ್ವಾಮಿಯವರ ಸಿನಿಮಾಯಾನ',
          en: "Dr. K. Puttaswamy's book Cinemayana",
        },
        layout: 'banner',
        galleryMode: 'carousel',
      },
    ],
  })
}

// --- PHOTO-STORY ---
{
  const enDir = findChild(EN_ROOT, '06_')
  const knDir = findChild(KN_ROOT, '06_')
  const p1 = loadPair(enDir, knDir, 1)
  const p2 = loadPair(enDir, knDir, 2)
  writePostsFile({
    outPath: path.join(ROOT, 'src/pages/photo-story/posts.js'),
    comment: 'Photo-Story posts registry.',
    postsName: 'photoStoryPosts',
    helperName: 'PhotoStory',
    posts: [
      {
        id: '01',
        slug: 'sync-sound-recording',
        image: '/menus/photostory/images/Photo_01.jpg',
        category: CAT.cinema,
        title: { kn: p1.kn.title, en: p1.en.title },
        body: { kn: p1.kn.body, en: p1.en.body },
        gallery: [
          {
            src: '/menus/photostory/images/Photo_02.jpg',
            caption: {
              kn: 'ದೂರದ ಬೆಟ್ಟ — ಸ್ಪಾಟ್ ರೆಕಾರ್ಡಿಂಗ್',
              en: 'Doorada Betta — sync sound on set',
            },
          },
        ],
        photoCredit: {
          kn: 'ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ',
          en: 'Pragathi Ashwathanarayana',
        },
        layout: 'landscape',
      },
      {
        id: '02',
        slug: 'ksn-anireekshita-songs',
        image: '/menus/photostory/images/02.jpg',
        category: CAT.cinema,
        title: { kn: p2.kn.title, en: p2.en.title },
        body: { kn: p2.kn.body, en: p2.en.body },
        photoCredit: {
          kn: 'ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ',
          en: 'Pragathi Ashwathanarayana',
        },
        layout: 'landscape',
      },
    ],
  })
}

// --- OFF THE CAMERA ---
{
  const enDir = findChild(EN_ROOT, '07_')
  const knDir = findChild(KN_ROOT, '07_')
  const p1 = loadPair(enDir, knDir, 1)
  const p2 = loadPair(enDir, knDir, 2)
  writePostsFile({
    outPath: path.join(ROOT, 'src/pages/off-the-camera/posts.js'),
    comment: 'Off the Camera posts registry.',
    postsName: 'offTheCameraPosts',
    helperName: 'OffTheCamera',
    posts: [
      {
        id: '01',
        slug: 'tape-over-moustache',
        image: '/menus/offthecamera/images/01.jpg',
        category: CAT.cinema,
        subtitle: { kn: 'ಗಿರಿಜಾ ಲೋಕೇಶ್', en: 'Girija Lokesh' },
        title: { kn: p1.kn.title, en: p1.en.title },
        body: { kn: p1.kn.body, en: p1.en.body },
        layout: 'overlap',
      },
      {
        id: '02',
        slug: 'balananna-ondu-muttina-kathe',
        image: '/menus/offthecamera/images/02.jpg',
        category: CAT.cinema,
        subtitle: { kn: 'ದೊಡ್ಡಣ್ಣ, ನಟ', en: 'Dodanna, Actor' },
        title: { kn: p2.kn.title, en: p2.en.title },
        body: { kn: p2.kn.body, en: p2.en.body },
        photoCredit: {
          kn: 'ಪ್ರಗತಿ ಅಶ್ವತ್ಥ ನಾರಾಯಣ',
          en: 'Pragathi Ashwathanarayana',
        },
        layout: 'overlap',
      },
    ],
  })
}

// --- ARTICLE ---
{
  const enDir = findChild(EN_ROOT, '08_')
  const knDir = findChild(KN_ROOT, '08_')
  const p1 = loadPair(enDir, knDir, 1)
  const p2 = loadPair(enDir, knDir, 2)
  const art1Dir = path.join(ROOT, 'public/menus/article/images/01-images')
  const art1Files = fs
    .readdirSync(art1Dir)
    .filter((f) => /\.(jpe?g)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const art2Dir = path.join(ROOT, 'public/menus/article/images/02-images')
  const art2Files = fs
    .readdirSync(art2Dir)
    .filter((f) => /\.(jpe?g)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  writePostsFile({
    outPath: path.join(ROOT, 'src/pages/article/posts.js'),
    comment: 'Article posts registry.',
    postsName: 'articlePosts',
    helperName: 'Article',
    posts: [
      {
        id: '01',
        slug: 'kannada-theatre-cinema-relationship',
        image: `/menus/article/images/01-images/${art1Files[0]}`,
        category: CAT.cinema,
        subtitle: {
          kn: 'ಕೆ.ಪುಟ್ಟಸ್ವಾಮಿ, ಲೇಖಕರು',
          en: 'K. Puttaswamy, Writer',
        },
        title: { kn: p1.kn.title, en: p1.en.title },
        body: { kn: p1.kn.body, en: p1.en.body },
        gallery: art1Files.slice(1).map((f) => ({
          src: `/menus/article/images/01-images/${f}`,
          caption: { kn: '', en: '' },
        })),
        layout: 'landscape',
        galleryMode: 'interleave',
      },
      {
        id: '02',
        slug: 'madakari-nadu-and-cinema',
        image: `/menus/article/images/02-images/${art2Files[0]}`,
        category: CAT.cinema,
        subtitle: {
          kn: 'ಶಶಿಧರ ಚಿತ್ರದುರ್ಗ, ಪತ್ರಕರ್ತ',
          en: 'Shashidhar Chitradurga, Journalist',
        },
        title: { kn: p2.kn.title, en: p2.en.title },
        body: { kn: p2.kn.body, en: p2.en.body },
        gallery: art2Files.slice(1).map((f) => ({
          src: `/menus/article/images/02-images/${f}`,
          caption: { kn: '', en: '' },
        })),
        layout: 'landscape',
        galleryMode: 'interleave',
      },
    ],
  })
}

// --- FILM TODAY ---
{
  const enDir = findChild(EN_ROOT, '09_')
  const knDir = findChild(KN_ROOT, '09_')
  const p1 = loadPair(enDir, knDir, 1)
  const p2 = loadPair(enDir, knDir, 2)
  writePostsFile({
    outPath: path.join(ROOT, 'src/pages/film-today/posts.js'),
    comment: 'Film Today posts registry.',
    postsName: 'filmTodayPosts',
    helperName: 'FilmToday',
    posts: [
      {
        id: '01',
        slug: 'rukmini-radhakrishna-songs',
        image: '/menus/film-today/images/01-images/01.jpeg',
        category: CAT.cinema,
        title: { kn: p1.kn.title, en: p1.en.title },
        body: { kn: p1.kn.body, en: p1.en.body },
        gallery: [
          {
            src: '/menus/film-today/images/01-images/02.jpeg',
            caption: { kn: '', en: '' },
          },
        ],
        layout: 'landscape',
      },
      {
        id: '02',
        slug: '666-operation-dream-theatre-teaser',
        image: '/menus/film-today/images/02-images/01.jpg',
        category: CAT.cinema,
        title: { kn: p2.kn.title, en: p2.en.title },
        body: { kn: p2.kn.body, en: p2.en.body },
        gallery: [
          {
            src: '/menus/film-today/images/02-images/02.jpg',
            caption: { kn: '', en: '' },
          },
        ],
        layout: 'landscape',
      },
    ],
  })
}

// --- POSTER (image-only) ---
{
  writePostsFile({
    outPath: path.join(ROOT, 'src/pages/poster/posts.js'),
    comment: 'Poster posts registry (image-led; no source txt yet).',
    postsName: 'posterPosts',
    helperName: 'Poster',
    posts: [
      {
        id: '01',
        slug: 'chomana-dudi',
        image: '/menus/poster/images/Chomana Dudi_F.jpg',
        category: CAT.cinema,
        title: { kn: 'ಚೋಮನ ದುಡಿ', en: 'Chomana Dudi' },
        body: {
          kn: 'ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.',
          en: 'A memorable poster from Kannada cinema history.',
        },
        layout: 'poster',
      },
      {
        id: '02',
        slug: 'grahana',
        image: '/menus/poster/images/Grahana copy.jpg',
        category: CAT.cinema,
        title: { kn: 'ಗ್ರಹಣ', en: 'Grahana' },
        body: {
          kn: 'ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.',
          en: 'A memorable poster from Kannada cinema history.',
        },
        layout: 'poster',
      },
      {
        id: '03',
        slug: 'rathnagiri-rahasya',
        image: '/menus/poster/images/Rathnagiri rahasya_Kannada.jpg',
        category: CAT.cinema,
        title: { kn: 'ರತ್ನಗಿರಿ ರಹಸ್ಯ', en: 'Rathnagiri Rahasya' },
        body: {
          kn: 'ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.',
          en: 'A memorable poster from Kannada cinema history.',
        },
        layout: 'poster',
      },
      {
        id: '04',
        slug: 'school-master',
        image: '/menus/poster/images/School Master.jpg',
        category: CAT.cinema,
        title: { kn: 'ಸ್ಕೂಲ್ ಮಾಸ್ಟರ್', en: 'School Master' },
        body: {
          kn: 'ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.',
          en: 'A memorable poster from Kannada cinema history.',
        },
        layout: 'poster',
      },
    ],
  })
}

console.log('Done.')
