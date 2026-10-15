import { Box } from '@radix-ui/themes'

import RegisterForm from './components/registerForm'
import AuthHeader from './components/authHeader'
import LoginForm from './components/loginForm'
import AuthTabs from './components/authTabs'
import { containerStyle } from './styles'
import Card from '@components/ui/card'
import useAuthPage from './hook'

export const AuthPage = () => {
  const { authMode, title, subtitle, handleModeChange } = useAuthPage()

  return (
    <Box style={containerStyle}>
      <AuthHeader title={title} subtitle={subtitle} />
      <Card>
        <Card.Content>
          <AuthTabs value={authMode} onChange={handleModeChange} />
          {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
        </Card.Content>
      </Card>
    </Box>
  )
}

export default AuthPage
