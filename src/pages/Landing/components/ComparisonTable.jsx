import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function ComparisonTable() {
  return (
    <section className="comparison-table-section">
      <div className="landing-container">
        <h2 className="section-title text-center mb-10">MADSuite vs. Les Autres</h2>
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                <th className="highlight-col">MADSuite</th>
                <th>Solutions génériques</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TPS/TVQ automatiques</td>
                <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                <td><AlertTriangle className="icon-warning mx-auto" /></td>
              </tr>
              <tr>
                <td>Instructions Interac intégrées</td>
                <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                <td><XCircle className="icon-error mx-auto" /></td>
              </tr>
              <tr>
                <td>Utilisateurs illimités</td>
                <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                <td><AlertTriangle className="icon-warning mx-auto" /></td>
              </tr>
              <tr>
                <td>Support québécois</td>
                <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                <td><XCircle className="icon-error mx-auto" /></td>
              </tr>
              <tr>
                <td>Gestion projets + facturation</td>
                <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                <td><AlertTriangle className="icon-warning mx-auto" /></td>
              </tr>
              <tr>
                <td>Application de bureau</td>
                <td className="highlight-col"><CheckCircle className="icon-success mx-auto" /></td>
                <td><XCircle className="icon-error mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
