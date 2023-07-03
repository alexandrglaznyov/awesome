const markdownLinkCheck = require('markdown-link-check');
const fs = require('fs');

const readmeContent = fs.readFileSync('../../README.md', 'utf8');
const replacementSymbol = '❌';
const replacementSymbolOk = '✅';

async function checkLinksInReadme() {
    return new Promise((resolve, reject) => {
        markdownLinkCheck(readmeContent, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
            const arrDead = [];
            const arrAlive = [];
            results.forEach((result) => {
                if(result.status === 'dead') {
                    arrDead.push(result.link);
                }
                if(result.status === 'alive'){
                    arrAlive.push(result.link)
                }
            });
            resolve({ arrDead, arrAlive });
        });
    });
}

async function updateLinks(arrDead, arrAlive, lines) {
    const updatedLines = lines.map((line) => {
        arrDead.forEach((link) => {
            if (line.includes(link)) {
                line = line.replace(replacementSymbolOk, replacementSymbol);
            }
        });
        arrAlive.forEach((link) => {
            if (line.includes(link)) {
                line = line.replace(replacementSymbol, replacementSymbolOk);
            }
        });
        return line;
    });
    return updatedLines;
}

async function main(){
    const { arrAlive, arrDead } = await checkLinksInReadme();
    const lines = readmeContent.split('\n');

    const updatedLines = await updateLinks(arrDead, arrAlive, lines);
    const updatedTable = updatedLines.join('\n');
    fs.writeFileSync('../../README.md', updatedTable, 'utf8');
}

main();