import { Box } from '@radix-ui/themes'

import { containerStyle, cardContentStyle } from './styles'
import SetupHeader from './components/setupHeader'
import SetupForm from './components/setupForm'
import Card from '@components/ui/card'
import useSetupPage from './hook'

export const SetupPage = () => {
  const { title, subtitle } = useSetupPage()

  return (
    <Box style={containerStyle}>
      <Card>
        <Card.Content style={cardContentStyle}>
          <SetupHeader title={title} subtitle={subtitle} />
          <SetupForm />
        </Card.Content>
      </Card>
    </Box>
  )
}

export default SetupPage
