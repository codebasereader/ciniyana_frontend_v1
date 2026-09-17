import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  createArticlePost,
  fetchArticlePosts,
  updateArticlePost,
} from '../../../api'
import { invalidateArticleCache } from '../../../pages/article/useArticlePosts'
import { selectLanguage } from '../../../store/slices/languageSlice'
import ArticleForm from './components/ArticleForm'
import { galleryFromPost, postToFormFields } from './utils'
import FormPageHeader from '../../components/FormPageHeader'

export default function ArticleFormPage() {
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
        const list = await fetchArticlePosts()
        const found = list.find((p) => String(p.id) === String(id))
        if (cancelled) return
        if (!found) {
          setError(isKn ? 'ಪೋಸ್ಟ್ ಸಿಗಲಿಲ್ಲ' : 'Post not found')
          setPost(null)
        } else {
          setPost(found)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load post')
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
  const initialGallery = useMemo(() => galleryFromPost(post), [post])

  const handleSubmit = async (fields, imageFile, gallerySlots, options = {}) => {
    setSubmitting(true)
    setError('')
    try {
      if (isEdit) {
        await updateArticlePost(
          id,
          fields,
          imageFile || undefined,
          gallerySlots,
          options,
        )
      } else {
        await createArticlePost(fields, imageFile, gallerySlots, options)
      }
      invalidateArticleCache()
      navigate('/admin/article', { replace: true })
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
      ? 'ಪೋಸ್ಟ್ ಸಂಪಾದಿಸಿ'
      : 'Edit post'
    : isKn
      ? 'ಹೊಸ ಪೋಸ್ಟ್'
      : 'New post'
  const submitLabel = isEdit ? (isKn ? 'ಅಪ್‌ಡೇಟ್' : 'Update') : isKn ? 'ರಚಿಸಿ' : 'Create'
  const goBack = () => navigate('/admin/article')

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
        <p
          className="mb-4 rounded-lg bg-[#ac222b]/10 px-3 py-2 text-sm font-medium text-[#ac222b]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <ArticleForm
        initialFields={initialFields}
        initialImageUrl={post?.image || ''}
        initialProfileImageUrl={post?.profile?.image || ''}
        initialGallery={initialGallery}
        submitting={submitting}
        submitLabel={submitLabel}
        onSubmit={handleSubmit}
        onCancel={goBack}
      />
    </div>
  )
}
