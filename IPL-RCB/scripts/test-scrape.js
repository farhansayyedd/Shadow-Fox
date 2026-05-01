const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('tmp_match1.html', 'utf8');
const $ = cheerio.load(html);

// Print ALL tables - full rows
const tables = $('table');
console.log('Total tables:', tables.length);

tables.each((ti, table) => {
  const rows = $(table).find('tr');
  if (rows.length < 2) return;
  console.log(`\n====== TABLE ${ti + 1} (${rows.length} rows) ======`);
  rows.each((ri, tr) => {
    const cells = $(tr).find('td,th').map((_, td) => {
      const text = $(td).text().trim().replace(/\s+/g, ' ');
      return `[${text}]`;
    }).get();
    if (cells.some(c => c.length > 2)) {
      process.stdout.write(`  R${ri}: ${cells.join(' ')}\n`);
    }
  });
});
