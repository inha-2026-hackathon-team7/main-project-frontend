import { Outlet } from "react-router-dom";
import GlobalStyle from "../styles/GlobalStyle.jsx";
import AuthExpiryWatcher from "../components/AuthExpiryWatcher.jsx";
import Snackbar from "../components/common/Snackbar.jsx";

export default function RootLayout() {
  return (
    <div className="st-root">
      <GlobalStyle />
      <div className="st-frame">
        <AuthExpiryWatcher />
        <Outlet />
        <Snackbar />
      </div>
    </div>
  );
}
