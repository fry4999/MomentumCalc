import Logo from "common/components/styling/Logo";
import { Link } from "react-router-dom";
import beltsConfig from "web/calculators/belts";
import ratioConfig from "web/calculators/ratio";
import motorsConfig from "web/info/motors";

export default function Nav(): JSX.Element {
  return (
    <nav className="app-navbar" aria-label="Primary navigation">
      <Link to="/" className="app-brand">
        <Logo />
      </Link>

      <div className="app-nav-links">
        <Link to="/" className="app-nav-link">
          Tools
        </Link>
        <Link to={beltsConfig.url} className="app-nav-link">
          Belts
        </Link>
        <Link to={ratioConfig.url} className="app-nav-link">
          Ratios
        </Link>
        <Link to={motorsConfig.url} className="app-nav-link">
          Motors
        </Link>
      </div>
    </nav>
  );
}
