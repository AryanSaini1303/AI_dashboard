import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud, ScanSearch, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { processWeighbridgeImage } from '../services/weighbridgeService'
import { useToast } from '../context/ToastContext'

export default function WeighbridgeCheck() {
  const { toast } = useToast()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  })

  async function runCheck() {
    if (!file) return
    setLoading(true)
    try {
      const data = await processWeighbridgeImage(file)
      setResult(data)
      toast({
        title: data.alignment_valid ? 'Aligned' : 'Not aligned',
        message: data.obstruction ? `Obstruction: ${data.obstruction}` : 'Check complete',
        variant: data.alignment_valid ? 'success' : 'warning'
      })
    } catch (e) {
      toast({ title: 'Request failed', message: 'Could not reach the weighbridge service.', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px]">
      <div className="facet glass border border-base-line p-5">
        <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Upload weighbridge image</p>
        <div
          {...getRootProps()}
          className={`facet-sm border-2 border-dashed h-72 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative overflow-hidden ${isDragActive ? 'border-amethyst bg-amethyst/10' : 'border-base-line hover:border-amethyst/60'
            }`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <img src={preview} alt="preview" className="max-h-full max-w-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 text-center">
              <UploadCloud size={24} className="text-amethyst" />
              <p className="text-sm text-quartz/60">Drag an image here, or click to choose a file</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={open} className="facet-sm border border-base-line px-3 py-1.5 text-xs">
            Choose file
          </button>
          {file && (
            <button onClick={reset} className="facet-sm border border-base-line px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>

        <button
          onClick={runCheck}
          disabled={!file || loading}
          className="w-full mt-4 specular facet-sm bg-amethyst hover:bg-amethyst/90 text-base font-semibold py-2.5 text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <ScanSearch size={16} />
          {loading ? 'Checking…' : 'Run alignment check'}
        </button>
      </div>

      <div className="facet glass border border-base-line p-5">
        <p className="text-xs uppercase tracking-wide text-quartz/50 mb-4">Result</p>
        {!result ? (
          <EmptyState icon={ScanSearch} title="No check yet" message="Upload an image and run the check to see alignment status." />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              {result.alignment_valid ? (
                <CheckCircle2 className="text-green-500" size={28} />
              ) : (
                <XCircle className="text-garnet" size={28} />
              )}
              <p className="font-display text-xl font-semibold">
                {result.alignment_valid ? 'Aligned' : 'Not Aligned'}
              </p>
            </div>
            {result.obstruction && (
              <p className="text-sm text-quartz/60">Obstruction: <span className="text-quartz">{result.obstruction}</span></p>
            )}
            {result.annotated_image && (
              <img src={result.annotated_image} alt="annotated result" className="rounded-lg border border-base-line max-w-full" />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
