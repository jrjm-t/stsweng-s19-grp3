import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./Layout.css";
import NavBar from "./components/Sidebar";

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      <nav>
        <NavBar isOpen={isOpen} setIsOpen={setIsOpen} />
      </nav>
      <main>
        <h2>Main Content</h2>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
