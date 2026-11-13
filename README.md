# bug-hunt-utils — Laporan Bug

Bounty AIProve: "Find the most real bugs in utils.js" (hadiah 0.5 NVDA).
Entry: `report.json` — JSON list `[{fn, input, expected}]`.
File yang diuji: `utils-under-test.js`, salinan verbatim dari
`/tmp/aiprove-spec/challenges/bug-hunt-utils/utils.js`
(sha256 `4334d36d1a6bcbb3d6f19cc498023acddb245be45c4468cd72563984d40c718e`,
sama dengan file spec — tidak diubah).

## Hasil

**6 bug terverifikasi dengan keyakinan penuh** (2 fungsi), **+ 2 laporan bonus**
(1 akar masalah, keyakinan lebih rendah — lihat catatan). Total laporan: 8.
Semua fungsi lain (`sum`, `max`, `reverse` ASCII, `isPalindrome` ASCII,
`clamp`, `unique`, `average`, `titleCase`) diuji dengan puluhan input
termasuk edge case dan hasilnya benar — tidak dilaporkan.

Verifikasi: `node verify.js` (output lengkap di `verify-output.txt`).

## Bug 1 — `factorial`: off-by-one, faktor `n` tidak pernah dikali

Kode: `for(let i=2;i<n;i++) r*=i;` — kondisi `i<n` seharusnya `i<=n`.

| input | utils.js | benar |
|---|---|---|
| `5` | 24 | 120 |
| `2` | 1 | 2 |
| `10` | 362880 | 3628800 |

`factorial(0)` dan `factorial(1)` benar (1), jadi bug hanya muncul untuk n ≥ 2.
Nilai benar dihitung manual (5! = 2·3·4·5 = 120; 10! = 3628800) dan cocok
dengan referensi independen di `verify.js`.

## Bug 2 — `countVowels`: regex kehilangan vokal huruf besar

Kode: `s.match(/[aeiou]/g)` — tidak ada huruf besar, seharusnya `[aeiouAEIOU]`.

| input | utils.js | benar |
|---|---|---|
| `"AEIOU"` | 0 | 5 |
| `"AeIoU"` | 2 | 5 |
| `"HELLO"` | 0 | 2 |

Input huruf kecil semua (`"hello"` → 2) benar, jadi bug hanya muncul bila ada
vokal kapital.

## Bonus — `reverse` / `isPalindrome`: karakter astral (emoji) rusak

`reverse` memakai `s.split("")` yang memecah pasangan surrogate UTF-16.

| fn | input | utils.js | benar |
|---|---|---|---|
| `reverse` | `"a😀b"` | `"b\uDE00\uD83Da"` (mojibake) | `"b😀a"` |
| `isPalindrome` | `"😀a😀"` | `false` | `true` |

**Catatan keyakinan:** kedua laporan ini benar secara definisi (string
dibalik / palindrom), TAPI bergantung pada apakah implementasi referensi
grader memakai `[...s]` (codepoint-aware) atau `split("")` yang naif seperti
utils.js. Bila referensi grader naif, kedua laporan ini tidak dihitung —
tidak ada penalti menurut spec ("reporting a correct function counts for
nothing"). Keduanya berasal dari satu akar masalah yang sama.

## Yang sengaja TIDAK dilaporkan

- `titleCase("don't")` → `"Don'T"`: perilaku regex `\b\w` yang standar;
  referensi yang wajar memakai regex yang sama. Ambigu, bukan bug jelas.
- `countVowels("café")` → 1: apakah `é` vokal masih diperdebatkan; set
  vokal standar adalah aeiou. Ambigu.
- `factorial(-1)` / `factorial(2.5)`, `clamp` dengan `lo>hi`, `max([])`:
  perilaku input di luar kontrak tidak terdefinisi; referensi loop-based
  yang wajar berperilaku sama. Ambigu.
