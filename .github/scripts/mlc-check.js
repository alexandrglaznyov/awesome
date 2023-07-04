const markdownLinkCheck = require('markdown-link-check');
const fs = require('fs');

const readmeContent = fs.readFileSync('../../README.md', 'utf8');
const { parseMarkdownTables } = require('./helper/index.js');

const replacementSymbolFaile = '❌';
const replacementSymbolOk = '✅';
const parsedTable = parseMarkdownTables(readmeContent);
const allLinksFromUrlsClm = parsedTable.map(table => table.url).flat().filter(Boolean);

async function checkLinksInReadme() {
    return new Promise((resolve, reject) => {
        markdownLinkCheck(readmeContent, (err, results) => {
            if (err) {
                console.warn(err)
                return resolve({ arrDead: [], arrAlive: [] })
            }
            const arrDead = [];
            const arrAlive = [];
            results.forEach((result) => {
                if(!allLinksFromUrlsClm.includes(result.link)) return;
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
                line = line.replace(replacementSymbolOk, replacementSymbolFaile);
            }
        });
        arrAlive.forEach((link) => {
            if (line.includes(link)) {
                line = line.replace(replacementSymbolFaile, replacementSymbolOk);
            }
        });
        return line;
    });
    return updatedLines;
}

(async function(){
    const { arrAlive, arrDead } = await checkLinksInReadme();
    const lines = readmeContent.split('\n');

    const updatedLines = await updateLinks(arrDead, arrAlive, lines);
    const updatedTable = updatedLines.join('\n');
    fs.writeFileSync('../../README.md', updatedTable, 'utf8');
})()