/**
 * Cream + mint vertical stripes from the reference strip image.
 * Cream #FAF3DF · Mint #B2DED3 · Top accent #FFB870
 */
export const CREAM_MINT_STRIPE = {
  backgroundColor: '#FAF3DF',
  backgroundImage:
    'repeating-linear-gradient(90deg, #FAF3DF 0px, #FAF3DF 11px, #B2DED3 11px, #B2DED3 22px)',
}

/**
 * Section banner themes — pastel logo panels from collage reference.
 * detailAccent = hero panel color on post detail (rich enough for white text).
 */
export const SECTION_THEMES = {
  'flash-back': {
    logoBg: '#FAF3DF',
    logoPanelStyle: CREAM_MINT_STRIPE,
    detailAccent: '#c45c12',
  },
  remembrance: {
    logoBg: '#ff502f',
    detailAccent: '#ff502f',
  },
  'info-special': {
    logoBg: '#C5E0D0',
    detailAccent: '#2f7a5c',
  },
  video: {
    logoBg: '#D8CCE8',
    detailAccent: '#6b4f9a',
  },
  poster: {
    logoBg: '#E8D5B0',
    detailAccent: '#9a6b2f',
  },
  'photo-story': {
    logoBg: '#C8E6F0',
    detailAccent: '#2a6f8a',
  },
  'off-the-camera': {
    logoBg: '#D4EEF5',
    detailAccent: '#1f7a8c',
  },
  article: {
    logoBg: '#D5DFC8',
    detailAccent: '#5a7040',
  },
  'film-today': {
    logoBg: '#D0DCE8',
    detailAccent: '#3d5a73',
  },
}
