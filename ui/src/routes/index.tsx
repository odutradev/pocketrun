import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AppLayout, ProtectedRoute, PublicRoute } from './components'
import PageContainer from '@components/layout/pageContainer'
import routes from './config'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {routes.map((route) => {
            const Component = route.component
            let element = (
              <PageContainer center={route.center}>
                <Component />
              </PageContainer>
            )

            if (route.protected) {
              element = <ProtectedRoute>{element}</ProtectedRoute>
            } else if (route.publicOnly) {
              element = <PublicRoute>{element}</PublicRoute>
            }

            return <Route key={route.path} path={route.path} element={element} />
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
