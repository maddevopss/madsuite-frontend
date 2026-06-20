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
    
    if (content.includes('res.data.data')) {
        content = content.replace(/res\.data\.data/g, 'res.data');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed res.data.data in ${file}`);
    }
});
