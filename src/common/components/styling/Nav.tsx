import Logo from "common/components/styling/Logo";
import { Link } from "react-router-dom";

export default function Nav(): JSX.Element {
  return (
    <nav className="app-navbar" aria-label="Primary navigation">
      <Link to="/" className="app-brand">
        <Logo color="white" />
      </Link>
    </nav>
  );
}
