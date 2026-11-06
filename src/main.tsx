import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Fonts are bundled and served from our own domain rather than loaded from
// Google's CDN, which would send every visitor's IP address to Google before
// any consent (LG München I, 20.01.2022, 3 O 17493/20).
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/inconsolata/400.css";
import "@fontsource/inconsolata/700.css";
import "@fontsource/saira-semi-condensed/500.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
