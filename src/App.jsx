import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <main>
        <AppRoutes />
      </main>
    </Router>
  );
}

export default App;