import { Box } from '@radix-ui/themes'

import SetupHeader from './components/setupHeader'
import SetupForm from './components/setupForm'
import { containerStyle } from './styles'
import Card from '@components/ui/card'
import useSetupPage from './hook'

export const SetupPage = () => {
  const { title, subtitle } = useSetupPage()

  return (
    <Box style={containerStyle}>
      <Card>
        <Card.Content>
          <SetupHeader title={title} subtitle={subtitle} />
          <SetupForm />
        </Card.Content>
      </Card>
    </Box>
  )
}

export default SetupPage
