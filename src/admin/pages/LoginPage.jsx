import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../api'
import { loginSuccess } from '../../store/slices/authSlice'
import { selectLanguage, setLanguage } from '../../store/slices/languageSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const language = useSelector(selectLanguage)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(setLanguage('en'))
  }, [dispatch])

  const isKn = language === 'kn'
  const logoSrc = isKn ? '/logo/logo_kn.png' : '/logo/logo_en.png'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const data = await login({ email, password })
      dispatch(
        loginSuccess({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }),
      )
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || (isKn ? 'ಲಾಗಿನ್ ವಿಫಲವಾಯಿತು' : 'Login failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f1ea] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logoSrc} alt="Ciniyaana" className="mb-4 h-16 w-auto object-contain" />
          <h1 className="text-2xl font-bold text-[#ac222b]">
            {isKn ? 'ಅಡ್ಮಿನ್ ಲಾಗಿನ್' : 'Admin login'}
          </h1>
          <p className="mt-1 text-sm text-[#666]">
            {isKn
              ? 'ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ'
              : 'Sign in with your email and password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#333]">
            {isKn ? 'ಇಮೇಲ್' : 'Email'}
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-[#ddd] px-3 py-2.5 text-base font-normal text-[#1a1a1a] outline-none focus:border-[#c4782a] focus:ring-2 focus:ring-[#e8a93a]/40"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#333]">
            {isKn ? 'ಪಾಸ್‌ವರ್ಡ್' : 'Password'}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[#ddd] px-3 py-2.5 text-base font-normal text-[#1a1a1a] outline-none focus:border-[#c4782a] focus:ring-2 focus:ring-[#e8a93a]/40"
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-[#ac222b]/10 px-3 py-2 text-sm font-medium text-[#ac222b]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-[#ac222b] px-4 py-2.5 text-sm font-bold tracking-wide text-white hover:bg-[#8f1c24] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting
              ? isKn
                ? 'ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...'
                : 'Signing in...'
              : isKn
                ? 'ಲಾಗಿನ್'
                : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
