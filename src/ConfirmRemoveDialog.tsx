import { useEffect } from 'react'
import type { MusicItem } from './types'

type Props = {
  track: MusicItem | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmRemoveDialog({ track, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!track) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [track, onCancel])

  if (!track) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title">ลบออกจากเพลงโปรด?</h3>
        <p>ต้องการลบ “{track.title}” ออกจากรายการเพลงโปรดใช่ไหม</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel} autoFocus>
            ยกเลิก
          </button>
          <button className="confirm-ok" onClick={onConfirm}>
            ลบออก
          </button>
        </div>
      </div>
    </div>
  )
}
