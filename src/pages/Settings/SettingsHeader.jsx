import { memo } from "react";
import { IoSettingsOutline } from "react-icons/io5";

function SettingsHeader() {
  return (
    <div className="page-header">
      <h1>
        <IoSettingsOutline className="icon" />
        Paramètres
      </h1>

      <p>Configuration générale de l'application.</p>
    </div>
  );
}

export default memo(SettingsHeader);
