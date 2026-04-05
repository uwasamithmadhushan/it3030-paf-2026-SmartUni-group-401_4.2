import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AssetList from './pages/AssetList';
import AssetForm from './pages/AssetForm';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<AssetList />} />
            <Route path="/add" element={<AssetForm />} />
            <Route path="/edit/:id" element={<AssetForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
