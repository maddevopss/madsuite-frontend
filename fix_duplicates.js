const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('t:/Projets/TimeMonitoring/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    let changed = false;
    
    // Find all react imports
    const reactImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]react['"]/g;
    
    content = content.replace(reactImportRegex, (match, importsStr) => {
        const tokens = importsStr.split(',').map(s => s.trim()).filter(Boolean);
        const uniqueTokens = [...new Set(tokens)];
        
        if (tokens.length !== uniqueTokens.length) {
            changed = true;
            return `import { ${uniqueTokens.join(', ')} } from "react"`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed duplicate imports in ${file}`);
    }
});
