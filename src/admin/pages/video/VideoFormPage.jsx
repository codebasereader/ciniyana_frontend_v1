import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  createVideoPost,
  fetchVideoPosts,
  updateVideoPost,
} from '../../../api'
import { invalidateVideoCache } from '../../../pages/video/useVideoPosts'
import { selectLanguage } from '../../../store/slices/languageSlice'
import VideoForm from './components/VideoForm'
import { postToFormFields } from './utils'
import FormPageHeader from '../../components/FormPageHeader'

export default function VideoFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const language = useSelector(selectLanguage)
  const isKn = language === 'kn'

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [post, setPost] = useState(null)

  useEffect(() => {
    if (!isEdit) return undefined
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const list = await fetchVideoPosts()
        const found = list.find((p) => String(p.id) === String(id))
        if (cancelled) return
        if (!found) {
          setError(isKn ? 'ವೀಡಿಯೋ ಸಿಗಲಿಲ್ಲ' : 'Video not found')
          setPost(null)
        } else {
          setPost(found)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load video')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, isEdit, isKn])

  const initialFields = useMemo(() => postToFormFields(post), [post])

  const handleSubmit = async (fields) => {
    setSubmitting(true)
    setError('')
    try {
      if (isEdit) {
        await updateVideoPost(id, fields)
      } else {
        await createVideoPost(fields)
      }
      invalidateVideoCache()
      navigate('/admin/video', { replace: true })
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-[#666]">{isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…' : 'Loading…'}</p>
  }

  const title = isEdit
    ? isKn
      ? 'ವೀಡಿಯೋ ಸಂಪಾದಿಸಿ'
      : 'Edit video'
    : isKn
      ? 'ಹೊಸ ವೀಡಿಯೋ'
      : 'New video'
  const submitLabel = isEdit ? (isKn ? 'ಅಪ್‌ಡೇಟ್' : 'Update') : isKn ? 'ರಚಿಸಿ' : 'Create'
  const goBack = () => navigate('/admin/video')

  return (
    <div>
      <FormPageHeader
        title={title}
        backLabel={isKn ? 'ಹಿಂದೆ' : 'Back'}
        onBack={goBack}
        submitLabel={submitLabel}
        submitting={submitting}
        cancelLabel={isKn ? 'ರದ್ದು' : 'Cancel'}
        onCancel={goBack}
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-[#ac222b]/10 px-3 py-2 text-sm font-medium text-[#ac222b]" role="alert">
          {error}
        </p>
      ) : null}

      <VideoForm
        initialFields={initialFields}
        submitting={submitting}
        submitLabel={submitLabel}
        onSubmit={handleSubmit}
        onCancel={goBack}
      />
    </div>
  )
}
