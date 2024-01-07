import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Error from "./pages/404";
import Layout from "./pages/Layout";
import Room from "./pages/Room";
import Host from "./pages/Host";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/:roomID" element={<Room />} />
        <Route path="/host/:roomID" element={<Host />} />
        {/* 404 ERROR */}
        <Route path="/*" element={<Error />} />
      </Route>
    </Routes>
  );
}

export default App;
