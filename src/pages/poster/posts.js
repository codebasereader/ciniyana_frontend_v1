/**
 * Poster posts registry (image-led; no source txt yet).
 * Auto-generated from CINIYAANA_Content — re-run: node scripts/generate-section-posts.mjs
 */
export const posterPosts = [
  {
    id: '01',
    slug: 'chomana-dudi',
    image: '/menus/poster/images/Chomana Dudi_F.jpg',
    date: '',
    category: {
      kn: 'ಕನ್ನಡ ಸಿನಿಮಾ',
      en: 'Kannada Cinema',
    },
    title: {
      kn: 'ಚೋಮನ ದುಡಿ',
      en: 'Chomana Dudi',
    },
    body: {
      kn: `ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.`,
      en: `A memorable poster from Kannada cinema history.`,
    },
    layout: 'poster',
  },
  {
    id: '02',
    slug: 'grahana',
    image: '/menus/poster/images/Grahana copy.jpg',
    date: '',
    category: {
      kn: 'ಕನ್ನಡ ಸಿನಿಮಾ',
      en: 'Kannada Cinema',
    },
    title: {
      kn: 'ಗ್ರಹಣ',
      en: 'Grahana',
    },
    body: {
      kn: `ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.`,
      en: `A memorable poster from Kannada cinema history.`,
    },
    layout: 'poster',
  },
  {
    id: '03',
    slug: 'rathnagiri-rahasya',
    image: '/menus/poster/images/Rathnagiri rahasya_Kannada.jpg',
    date: '',
    category: {
      kn: 'ಕನ್ನಡ ಸಿನಿಮಾ',
      en: 'Kannada Cinema',
    },
    title: {
      kn: 'ರತ್ನಗಿರಿ ರಹಸ್ಯ',
      en: 'Rathnagiri Rahasya',
    },
    body: {
      kn: `ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.`,
      en: `A memorable poster from Kannada cinema history.`,
    },
    layout: 'poster',
  },
  {
    id: '04',
    slug: 'school-master',
    image: '/menus/poster/images/School Master.jpg',
    date: '',
    category: {
      kn: 'ಕನ್ನಡ ಸಿನಿಮಾ',
      en: 'Kannada Cinema',
    },
    title: {
      kn: 'ಸ್ಕೂಲ್ ಮಾಸ್ಟರ್',
      en: 'School Master',
    },
    body: {
      kn: `ಕನ್ನಡ ಸಿನಿಮಾ ಇತಿಹಾಸದ ಸ್ಮರಣೀಯ ಪೋಸ್ಟರ್.`,
      en: `A memorable poster from Kannada cinema history.`,
    },
    layout: 'poster',
  },
]

export function getPosterPostBySlug(slug) {
  return posterPosts.find((post) => post.slug === slug) ?? null
}

export function getPosterAdjacent(slug) {
  const index = posterPosts.findIndex((post) => post.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: index > 0 ? posterPosts[index - 1] : null,
    next: index < posterPosts.length - 1 ? posterPosts[index + 1] : null,
  }
}

export function getPosterRelated(slug, limit = 4) {
  return posterPosts.filter((post) => post.slug !== slug).slice(0, limit)
}

