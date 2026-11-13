// Verifikasi lokal untuk laporan bug-hunt-utils.
// (a) load utils.js yang diuji, (b) jalankan tiap laporan dan konfirmasi
//     utils.js BENAR-BENAR mengembalikan hasil yang salah,
// (c) konfirmasi nilai `expected` dengan implementasi referensi independen
//     (ditulis dari definisi fungsi, bukan dari kode utils.js).
// Keluar 0 hanya bila semua laporan terverifikasi sebagai bug nyata.
const fs = require('fs');
const u = require('./utils-under-test.js');

// Referensi independen (definisi yang benar dari nama/dokumentasi fungsi)
const ref = {
  factorial: n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
  countVowels: s => (s.match(/[aeiouAEIOU]/g) || []).length,
  reverse: s => [...s].reverse().join(''),
  isPalindrome: s => s === [...s].reverse().join(''),
};

const reports = JSON.parse(fs.readFileSync('./report.json', 'utf8'));
let verified = 0, failed = 0;
for (const { fn, input, expected } of reports) {
  const got = u[fn](input);
  const want = ref[fn](input);
  const exposesBug = JSON.stringify(got) !== JSON.stringify(expected);
  const expectedCorrect = JSON.stringify(want) === JSON.stringify(expected);
  const status = exposesBug && expectedCorrect ? 'VERIFIED BUG' : 'FAILED';
  if (status === 'VERIFIED BUG') verified++; else failed++;
  console.log(`[${status}] ${fn}(${JSON.stringify(input)}) => utils.js: ${JSON.stringify(got)} | expected (benar): ${JSON.stringify(expected)} | referensi independen: ${JSON.stringify(want)}`);
}
console.log(`\nRingkasan: ${verified} bug terverifikasi dari ${reports.length} laporan, ${failed} gagal.`);
process.exit(failed ? 1 : 0);
