const src = require('fs').readFileSync('js/official-data.js', 'utf8');
const D = eval(src.replace('window.ALL_IPL_2026', 'D') + '; D');
const m1 = D[0];
console.log('Match 1 result:', m1.result);
console.log('Match 1 winner:', m1.winner);
console.log('Inn1 team:', m1.scorecard?.inn1?.team, m1.scorecard?.inn1?.score);
console.log('Inn1 batting:', JSON.stringify(m1.scorecard?.inn1?.bat));
console.log('Inn2 team:', m1.scorecard?.inn2?.team, m1.scorecard?.inn2?.score);
console.log('Inn2 batting:', JSON.stringify(m1.scorecard?.inn2?.bat));
