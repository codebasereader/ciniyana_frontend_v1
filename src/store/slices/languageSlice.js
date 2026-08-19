import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  /** @type {'kn' | 'en'} */
  language: 'kn',
}

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage(state, action) {
      state.language = action.payload
    },
    toggleLanguage(state) {
      state.language = state.language === 'kn' ? 'en' : 'kn'
    },
  },
})

export const { setLanguage, toggleLanguage } = languageSlice.actions
export const selectLanguage = (state) => state.language.language
export default languageSlice.reducer
