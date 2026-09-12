import { Outlet } from "react-router-dom";
import GlobalStyle from "../styles/GlobalStyle.jsx";

export default function RootLayout() {
  return (
    <div className="st-root">
      <GlobalStyle />
      <div className="st-frame">
        <Outlet />
      </div>
    </div>
  );
}
