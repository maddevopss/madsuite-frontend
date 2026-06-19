import { BsTools } from "react-icons/bs";
import "../styles/clients.css";

export default function ComingSoon({ title = "Module en construction" }) {
  return (
    <div className="clients-page">
      <h1>
        <BsTools className="icon" />
        {title}
      </h1>

      <div className="clients-grid">
        <div className="client-card">
          <h3>En construction</h3>

          <p>
            Ce module est en développement. Il va arriver bientôt, quand les bogues auront arrêté de se reproduire comme des
            lapins sous caféine.
          </p>

          <div className="stats">
            <span>Statut : En cours</span>
            <span>Version : bientôt</span>
          </div>
        </div>
      </div>
    </div>
  );
}
