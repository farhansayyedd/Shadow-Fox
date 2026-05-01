// Analyze match 1 HTML structure carefully
const cheerio = require('cheerio');
const fs = require('fs');
const html = fs.readFileSync('tmp_match1.html', 'utf8');
const $ = cheerio.load(html);

const tables = $('table');
console.log('Total tables:', tables.length);

// Print tables 1-11 fully (those are scorecard, 12/13 are squad)
tables.each((ti, table) => {
  if (ti >= 11) return;
  const rows = $(table).find('tr');
  console.log(`\n====== TABLE ${ti+1} (${rows.length} rows) ======`);
  rows.each((ri, tr) => {
    const cells = $(tr).find('td,th').map((_, td) => `[${$(td).text().trim().replace(/\s+/g,' ')}]`).get();
    if (cells.join('').replace(/\[\]/g,'').length > 2) {
      console.log(`  R${ri}: ${cells.join('')}`);
    }
  });
});
