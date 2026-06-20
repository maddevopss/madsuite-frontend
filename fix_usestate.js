const fs = require('fs');
const path = require('path');

const files = [
  't:\\Projets\\TimeMonitoring\\frontend\\src\\api\\authContext.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\components\\AiCopilot\\AiCopilot.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\components\\HubTabs.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\hooks\\useClients.js',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\hooks\\useConfirm.js',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\hooks\\useEstimates.js',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\hooks\\useModules.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\AuditLogs.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\CalculKm\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Estimates\\CreateEstimateModal.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Expenses\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Kiosk\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\KioskKm\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\MobilePunch\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\OrganisationSettings.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Portal\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Portal\\SignaturePad.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Settings\\SettingsInteracCard.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Settings\\SettingsStripeConnectCard.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Timesheet\\AutoTimesheetModal.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Timesheet\\CalendarIntegration.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Timesheet\\index.jsx',
  't:\\Projets\\TimeMonitoring\\frontend\\src\\pages\\Users\\UsersList.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Si useState est utilisé mais pas importé
    if (content.includes('useState') && !content.includes('useState} from') && !content.includes('useState } from') && !content.includes('import useState from') && !content.includes('import {useState')) {
        // Est-ce qu'on a déjà un import from "react" ou 'react'?
        const reactImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react['"]/;
        const match = content.match(reactImportRegex);
        
        if (match) {
            // Ajouter useState à l'import existant
            const newImport = match[0].replace('{', '{ useState, ');
            content = content.replace(match[0], newImport);
        } else {
            // Ajouter import { useState } from 'react'; au début du fichier
            // (après les commentaires éventuels ou juste tout en haut)
            content = `import { useState } from "react";\n` + content;
        }
        
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});
