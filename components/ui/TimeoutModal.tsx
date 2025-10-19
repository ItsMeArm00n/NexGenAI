import React from "react"
import { X } from "lucide-react"

type TimeoutModalProps = {
  open: boolean
  title?: string
  message?: string
  onClose: () => void
  children?: React.ReactNode
}

export const TimeoutModal: React.FC<TimeoutModalProps> = ({ open, title = "Slow response", message, onClose, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-fade-in">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-lg" onClick={onClose} />

      <div className="relative w-full max-w-md bg-card border-2 border-warning/50 rounded-2xl shadow-2xl animate-modal-slide-up p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-muted/50 hover:bg-muted hover:scale-110 rounded-full transition-all duration-300"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-warning/20 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 11 3 12a9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">{title}</h2>

          <p className="text-muted-foreground mb-4 leading-relaxed">{message}</p>

          {children}

          <button
            onClick={onClose}
            className="mt-2 w-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 hover:scale-105 glow-effect transition-all duration-300 py-3 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimeoutModal
