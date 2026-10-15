import { SegmentedControl, Box } from '@radix-ui/themes'

import type { AuthTabsProps } from './types'
import type { AuthMode } from '../../types'

export const AuthTabs = ({ value, onChange }: AuthTabsProps) => {
  return (
    <Box mb="4">
      <SegmentedControl.Root
        value={value}
        onValueChange={(val) => onChange(val as AuthMode)}
        size="2"
        style={{ width: '100%' }}
      >
        <SegmentedControl.Item value="login">Entrar</SegmentedControl.Item>
        <SegmentedControl.Item value="register">Novo Cadastro</SegmentedControl.Item>
      </SegmentedControl.Root>
    </Box>
  )
}

export default AuthTabs
