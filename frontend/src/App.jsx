import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import LongTerm from "./pages/LongTerm.jsx";
import ShortTerm from "./pages/ShortTerm.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shortterm" element={<ShortTerm />} />
      <Route path="/longterm" element={<LongTerm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

