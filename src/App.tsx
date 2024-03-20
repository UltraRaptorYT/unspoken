import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Error from "./pages/404";
import Layout from "./pages/Layout";
import Room from "./pages/Room";
import Host from "./pages/Host";
import FakeHost from "./pages/FakeHost";
import Image from "./pages/Image";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/:room_id" element={<Room />} />
        <Route path="/host/:room_id" element={<Host />} />
        <Route path="/image/:image_url" element={<Image />} />
        <Route path="/fake/host" element={<FakeHost />} />
        {/* 404 ERROR */}
        <Route path="/*" element={<Error />} />
      </Route>
    </Routes>
  );
}

export default App;
