import { useSelector } from 'react-redux'
import { selectLanguage } from '../../store/slices/languageSlice'

export default function DashboardPage() {
  const language = useSelector(selectLanguage)
  const isKn = language === 'kn'

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-[#ac222b] sm:text-3xl">
        {isKn ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Dashboard'}
      </h1>
      <p className="mt-6 rounded-xl border border-[#ead9c4] bg-[#fbf6ef] px-4 py-3 text-sm text-[#555]">
        {isKn
          ? 'ಮೆನು-ವಾರು ಪೋಸ್ಟ್ ನಿರ್ವಹಣೆ ಮುಂದೆ ಸೇರುತ್ತದೆ. ಈಗ ನ್ಯಾವಿಗೇಷನ್ ಸಿದ್ಧವಾಗಿದೆ.'
          : 'Menu-wise post management will be added next. Navigation is ready to use.'}
      </p>
    </div>
  )
}
