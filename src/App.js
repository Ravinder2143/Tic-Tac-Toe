import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchingPage from "./Project/Searching_page";
import MainPage from "./Project/MainPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchingPage />} />
        <Route path="/MainPage" element={<MainPage />} />
        {/* <Route path="/MainPage" element={<MainPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;