const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('tmp_match1.html', 'utf8');
const $ = cheerio.load(html);

// Print TABLE 1 fully - this is the main scorecard
const t = $('table').eq(0);
const rows = t.find('tr');
console.log('Table 1 rows:', rows.length);
rows.each((ri, tr) => {
  const cells = $(tr).find('td,th').map((_, td) => '[' + $(td).text().trim().replace(/\s+/g, ' ') + ']').get();
  console.log('R' + ri + ':', cells.join(''));
});

// Also check table 2-8
for (let i = 1; i <= 8; i++) {
  const t2 = $('table').eq(i);
  const rows2 = t2.find('tr');
  if (rows2.length < 2) continue;
  console.log(`\n=== TABLE ${i+1} (${rows2.length} rows) ===`);
  rows2.each((ri, tr) => {
    const cells = $(tr).find('td,th').map((_, td) => '[' + $(td).text().trim().replace(/\s+/g, ' ') + ']').get();
    console.log('R' + ri + ':', cells.join(''));
  });
}
