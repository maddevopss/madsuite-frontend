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
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('useState') && !content.includes('useState} from') && !content.includes('useState } from') && !content.includes('import useState from')) {
                results.push(file);
            }
        }
    });
    return results;
}

const res = walk('t:/Projets/TimeMonitoring/frontend/src');
console.log('Files with missing useState import:');
console.log(res);
