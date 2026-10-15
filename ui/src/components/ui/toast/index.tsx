import { Box, Flex, Text, IconButton, Callout } from '@radix-ui/themes'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

import useToastStore from '@stores/toast'

import type { ToastType } from '@stores/toast/types'
import type { ToastContainerProps } from './types'
import type { CSSProperties } from 'react'

const containerStyles: Record<string, CSSProperties> = {
  'top-right': {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxWidth: 420,
    width: '100%',
    pointerEvents: 'none'
  }
}

const colorMap: Record<ToastType, 'green' | 'red' | 'amber' | 'blue'> = {
  success: 'green',
  error: 'red',
  warning: 'amber',
  info: 'blue'
}

export const ToastContainer = ({ position = 'top-right' }: ToastContainerProps) => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) {
    return null
  }

  return (
    <Box style={containerStyles[position]}>
      {toasts.map((toast) => (
        <Callout.Root
          key={toast.id}
          color={colorMap[toast.type]}
          size="2"
          style={{
            pointerEvents: 'auto',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <Callout.Icon>
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {(toast.type === 'info' || toast.type === 'warning') && <Info size={18} />}
          </Callout.Icon>

          <Flex justify="between" align="center" width="100%">
            <Box>
              {toast.title && (
                <Text size="2" weight="bold" style={{ display: 'block' }}>
                  {toast.title}
                </Text>
              )}
              <Callout.Text size="2">{toast.message}</Callout.Text>
            </Box>

            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              type="button"
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </IconButton>
          </Flex>
        </Callout.Root>
      ))}
    </Box>
  )
}

export default ToastContainer
