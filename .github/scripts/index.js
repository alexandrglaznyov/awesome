const markdownLinkCheck = require('markdown-link-check');
const fs = require('fs');

const readmeContent = fs.readFileSync('awesome/README.md', 'utf8');
const replacementSymbol = '❌';
const replacementSymbolOk = '✅';
const lines = readmeContent.split('\n');

async function checkLinksInReadme() {
    const arrDead = []
    const arrAlive = []
    return new Promise((resolve, reject) => {
        markdownLinkCheck(readmeContent, (err, results) => {
            if (err) {
                reject(err);
                return;
            }
           

            results.forEach((result) => {
                const linkLine = lines.find((line) => line.includes(result.link));
                const currentStatus = linkLine.includes(replacementSymbolOk) ? 'alive' : 'dead';
                if(result.status === 'dead' && currentStatus === 'alive') {
                    arrDead.push(result.link);
                }
                if(result.status === 'alive' && currentStatus === 'dead') {
                    arrAlive.push(result.link)
                }
            });
            resolve({
                arrDead,
                arrAlive
            });
        });
    });
}

async function updateLinks(arrDead, arrAlive) {
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
    const {arrAlive, arrDead} = await checkLinksInReadme();
    if (arrAlive.length || arrDead.length) {
        const updatedLines = await updateLinks(arrDead, arrAlive);
        const updatedTable = updatedLines.join('\n');
        fs.writeFileSync('awesome/README.md', updatedTable, 'utf8');
        process.stdout.write('updated\n');
    }
}

main();
