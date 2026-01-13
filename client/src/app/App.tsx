import { AppRouter } from "./router"
import { LocationModal } from "../shared/location-modal"
import { useAuth } from "../contexts/useAuth"

function App() {
  const { user } = useAuth();
  const isAdminOrWorker = user?.role === 'admin' || user?.role === 'worker';

  return (
    <>
      {!isAdminOrWorker && <LocationModal />}
      <AppRouter />
    </>
  )
}

export default App
