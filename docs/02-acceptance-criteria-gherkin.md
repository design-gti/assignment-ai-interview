# Acceptance Criteria & Gherkin — Interview AI + Validasi Asesor

> Pendamping [01-flow-end-to-end.md](01-flow-end-to-end.md). Setiap epic berisi
> daftar acceptance criteria dan skenario Gherkin berbahasa Indonesia (dialek `id`
> Cucumber/Gherkin — `Fitur`, `Dasar`, `Skenario`, `Dengan`, `Ketika`, `Maka`, `Dan`, `Tapi`).
>
> **Legenda status:**
> ✅ sudah terimplementasi di prototype · 🟡 sebagian · 🔴 spesifikasi, belum dibangun

**Versi:** 1.0 · **Tanggal:** 15 September 2026

---

## Daftar Epic

| Epic | Nama | Halaman | Status |
|---|---|---|---|
| [E1](#e1--item-management-bank-item) | Item Management (Bank Item) | `item-management.html` | ✅ |
| [E2](#e2--paket-interview) | Paket Interview | `item-management.html#paket` | ✅ |
| [E3](#e3--assignment-kandidat) | Assignment Kandidat | `assignment.html` | ✅ |
| [E4](#e4--pelaksanaan-interview) | Pelaksanaan Interview | `01-`…`03-interview.html` | 🟡 |
| [E5](#e5--report-ai) | Report AI | `04-results.html` | 🟡 |
| [E6](#e6--assignment-asesor) | Assignment Asesor | `assignment.html#asesor` | ✅ |
| [E7](#e7--validasi-oleh-asesor) | Validasi oleh Asesor | *(belum ada)* | 🔴 |
| [E8](#e8--monitoring) | Monitoring | `monitoring.html` | ✅ |
| [E9](#e9--navigasi--struktur-halaman) | Navigasi & Struktur Halaman | semua | ✅ |

---

## E1 · Item Management (Bank Item)

**Sebagai** admin
**Saya ingin** menyusun bank kompetensi berjenjang Cluster → Aspek → Item
**Supaya** AI punya rubrik yang jelas untuk menilai jawaban kandidat

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC1.1 | Admin bisa membuat, mengubah, dan menghapus Cluster (nama, warna dari 8 preset, deskripsi) | ✅ |
| AC1.2 | Cluster **tidak bisa** dihapus selama masih memuat aspek | ✅ |
| AC1.3 | Admin bisa membuat & mengubah Aspek, termasuk rubrik 5 level (L1–L5) | ✅ |
| AC1.4 | Setiap Aspek wajib menempel ke satu Cluster | ✅ |
| AC1.5 | Admin bisa membuat Item Pertanyaan yang selalu menempel ke satu Aspek | ✅ |
| AC1.6 | Item baru selalu tersimpan berstatus **Draft** | ✅ |
| AC1.7 | Status item bisa di-toggle Draft ↔ Aktif langsung dari baris tabel | ✅ |
| AC1.8 | Mengubah rubrik aspek yang dipakai paket **Published** memunculkan konfirmasi | ✅ |
| AC1.9 | Item & aspek berstatus `Archived` tidak muncul di penyusunan paket | ✅ |

### Gherkin

```gherkin
# language: id
Fitur: Item Management — Bank Item
  Sebagai admin
  Saya ingin menyusun bank kompetensi berjenjang
  Supaya AI punya rubrik yang jelas untuk menilai jawaban kandidat

  Dasar:
    Dengan saya membuka halaman "Item Management" pada tab "Bank Item"

  Skenario: Membuat cluster baru
    Ketika saya menambah cluster dengan nama "Leadership" dan warna "#8b5cf6"
    Maka cluster "Leadership" muncul di daftar cluster
    Dan cluster tersebut menampilkan hitungan "0 item"

  Skenario: Cluster berisi aspek tidak boleh dihapus
    Dengan cluster "Soft Skills" memuat 4 aspek
    Ketika saya mencoba menghapus cluster "Soft Skills"
    Maka cluster "Soft Skills" tetap ada
    Dan saya melihat pesan "Tidak bisa hapus \"Soft Skills\" — masih ada aspek di dalamnya"

  Skenario: Membuat aspek beserta rubriknya
    Dengan cluster "Soft Skills" sudah ada
    Ketika saya menambah aspek dengan data berikut:
      | field       | nilai                              |
      | nama        | Problem Solving                    |
      | cluster     | Soft Skills                        |
      | deskripsi   | Kemampuan mengurai dan menyelesaikan masalah |
    Dan saya mengisi rubrik untuk level 1 sampai level 5
    Maka aspek "Problem Solving" tersimpan di bawah cluster "Soft Skills"
    Dan aspek tersebut berstatus "Aktif"

  Skenario: Item pertanyaan baru selalu berstatus Draft
    Dengan aspek "Problem Solving" sudah ada
    Ketika saya menambah item pertanyaan "Ceritakan masalah tersulit yang pernah Anda selesaikan"
    Dan saya menempelkannya ke aspek "Problem Solving"
    Dan saya menekan "Simpan sebagai Draft"
    Maka item tersebut muncul di bawah aspek "Problem Solving"
    Tapi status item tersebut adalah "Draft"

  Skenario: Mengaktifkan item lewat toggle
    Dengan item "Q015" berstatus "Draft"
    Ketika saya menggeser toggle status pada baris item "Q015"
    Maka status item "Q015" berubah menjadi "Aktif"
    Dan perubahan tersimpan tanpa perlu menekan tombol simpan terpisah

  Skenario: Mengubah rubrik aspek yang sedang dipakai paket Published
    Dengan aspek "Problem Solving" dipakai oleh paket "Sales Hunter v1" berstatus "Published"
    Ketika saya mengubah teks rubrik level 3 pada aspek "Problem Solving"
    Dan saya menekan "Simpan"
    Maka saya melihat konfirmasi yang menyarankan membuat versi baru paket
    Dan perubahan hanya tersimpan bila saya menyetujui konfirmasi tersebut
```

---

## E2 · Paket Interview

**Sebagai** admin
**Saya ingin** merakit item menjadi paket dengan target level dan bobot
**Supaya** paket bisa di-assign ke kandidat dan skor AI punya pembanding

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC2.1 | Paket baru selalu tersimpan berstatus **Draft** dengan `locked:false` | ✅ |
| AC2.2 | Setiap item di paket punya **target level** (L1–L5) dan **bobot** (Rendah/Sedang/Tinggi) sendiri | ✅ |
| AC2.3 | Urutan item di paket bisa diatur naik/turun | ✅ |
| AC2.4 | Paket **kosong** tidak bisa di-publish | ✅ |
| AC2.5 | Paket hanya bisa di-publish bila **semua** itemnya berstatus `Aktif` | ✅ |
| AC2.6 | Paket berstatus `Published` bisa di-archive | ✅ |
| AC2.7 | Paket `locked` bersifat read-only — field di-disable, tombol Simpan disembunyikan | ✅ |
| AC2.8 | Duplikat paket menghasilkan versi baru (`v2`, `v3`, …) berstatus Draft dan `locked:false` | ✅ |
| AC2.9 | Hanya paket yang tersedia yang muncul di dropdown Assignment Kandidat | ✅ |
| AC2.10 | Toggle `showResult` menentukan apakah kandidat boleh melihat hasilnya sendiri | ✅ |

### Gherkin

```gherkin
# language: id
Fitur: Paket Interview
  Sebagai admin
  Saya ingin merakit item menjadi paket dengan target level dan bobot
  Supaya paket bisa di-assign ke kandidat

  Dasar:
    Dengan saya membuka halaman "Item Management" pada tab "Paket Interview"

  Skenario: Paket baru tersimpan sebagai Draft
    Ketika saya membuat paket baru bernama "Customer Service v1"
    Dan saya menambahkan 3 item aktif ke dalamnya
    Dan saya menekan "Simpan"
    Maka paket "Customer Service v1" muncul di daftar paket
    Dan status paket tersebut adalah "Draft"
    Dan paket tersebut tidak terkunci

  Skenario: Paket kosong tidak bisa di-publish
    Dengan paket "Customer Service v1" berstatus "Draft" tanpa item
    Ketika saya menekan tombol publish pada paket "Customer Service v1"
    Maka status paket tetap "Draft"
    Dan saya melihat pesan "Paket kosong — tambah item dulu"

  Skenario: Guardrail item non-aktif menahan publish
    Dengan paket "Customer Service v1" berstatus "Draft"
    Dan paket tersebut memuat item "Q020" yang berstatus "Draft"
    Ketika saya menekan tombol publish pada paket "Customer Service v1"
    Maka status paket tetap "Draft"
    Dan saya melihat pesan "Guardrail: semua item harus Aktif sebelum publish"

  Skenario: Publish berhasil ketika semua item aktif
    Dengan paket "Customer Service v1" berstatus "Draft"
    Dan seluruh item di dalamnya berstatus "Aktif"
    Ketika saya menekan tombol publish pada paket "Customer Service v1"
    Maka status paket berubah menjadi "Published"
    Dan saya melihat pesan "Customer Service v1 → Published"

  Skenario: Paket terkunci bersifat read-only
    Dengan paket "Sales Hunter v1" berstatus "Published" dan terkunci
    Ketika saya membuka detail paket "Sales Hunter v1"
    Maka judul modal memuat teks "terkunci"
    Dan field nama paket tidak bisa diubah
    Dan tombol "Simpan" tidak ditampilkan
    Dan tombol tambah item tidak bisa ditekan

  Skenario: Duplikat paket sebagai jalur perubahan resmi
    Dengan paket "Sales Hunter v1" berstatus "Published" dan terkunci
    Ketika saya menekan tombol duplikat pada paket "Sales Hunter v1"
    Maka paket baru "Sales Hunter v2" dibuat
    Dan status paket baru tersebut adalah "Draft"
    Dan paket baru tersebut tidak terkunci
    Dan paket baru tersebut belum pernah di-assign

  Skenario Konsep: Target dan bobot per item
    Dengan saya sedang menyunting paket "Customer Service v1"
    Ketika saya menetapkan target "<target>" dan bobot "<bobot>" pada item "Q001"
    Maka pengaturan tersebut tersimpan pada paket, bukan pada item aslinya

    Contoh:
      | target | bobot  |
      | 3      | Rendah |
      | 4      | Sedang |
      | 5      | Tinggi |
```

---

## E3 · Assignment Kandidat

**Sebagai** admin
**Saya ingin** membuat batch interview dan memasukkan daftar peserta
**Supaya** kandidat mendapat akses untuk menjalani interview AI

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC3.1 | Form memvalidasi Nama Batch, Tanggal Mulai, Tanggal Selesai, dan Paket sebagai field wajib | ✅ |
| AC3.2 | Tanggal Selesai tidak boleh lebih awal dari Tanggal Mulai | ✅ |
| AC3.3 | Batch wajib memuat minimal 1 peserta | ✅ |
| AC3.4 | Peserta bisa dimuat lewat upload Excel **atau** input manual, dalam satu batch yang sama | ✅ |
| AC3.5 | Upload hanya menerima `.xlsx` / `.xls` | ✅ |
| AC3.6 | Excel wajib punya kolom header yang memuat kata `name` dan `email` | ✅ |
| AC3.7 | Email duplikat dilewati dan jumlahnya dilaporkan di ringkasan upload | ✅ |
| AC3.8 | Batas maksimum **300 peserta** per batch berlaku di kedua jalur input | ✅ |
| AC3.9 | Tersedia tombol download template Excel | ✅ |
| AC3.10 | Input manual memvalidasi format email dan menolak duplikat | ✅ |
| AC3.11 | Setiap peserta menghasilkan satu record kandidat berstatus `Assigned` dengan token unik 16 karakter | ✅ |
| AC3.12 | Form direset otomatis setelah submit berhasil | ✅ |
| AC3.13 | Undangan terkirim ke email/WA kandidat | 🔴 Gap #4 |

### Gherkin

```gherkin
# language: id
Fitur: Assignment Kandidat
  Sebagai admin
  Saya ingin membuat batch interview dan memasukkan daftar peserta
  Supaya kandidat mendapat akses untuk menjalani interview AI

  Dasar:
    Dengan terdapat paket "Sales Hunter v1" yang tersedia
    Dan saya membuka halaman "Assignment" pada tab "Assignment Kandidat"

  Skenario: Membuat batch lengkap lewat input manual
    Ketika saya mengisi informasi batch berikut:
      | field           | nilai                    |
      | Nama Batch      | Interview AI — Sales Q1  |
      | Tanggal Mulai   | 2026-10-01               |
      | Tanggal Selesai | 2026-10-15               |
      | Paket Interview | Sales Hunter v1          |
    Dan saya menambahkan peserta "Budi Santoso" dengan email "budi@example.com"
    Dan saya menambahkan peserta "Ani Wijaya" dengan email "ani@example.com"
    Dan saya menekan tombol submit
    Maka saya melihat pesan "2 peserta berhasil di-assign!"
    Dan 2 kandidat tersimpan dengan status "Assigned"
    Dan setiap kandidat memiliki token akses sepanjang 16 karakter
    Dan form direset otomatis

  Skenario Konsep: Validasi field wajib
    Ketika saya mengisi form tanpa "<field kosong>"
    Dan saya menekan tombol submit
    Maka tidak ada kandidat yang tersimpan
    Dan saya melihat pesan "<pesan>"

    Contoh:
      | field kosong    | pesan                                  |
      | Nama Batch      | Nama Batch wajib diisi                 |
      | Tanggal Mulai   | Tanggal Mulai wajib diisi              |
      | Tanggal Selesai | Tanggal Selesai wajib diisi            |
      | Paket Interview | Pilih Paket Interview terlebih dahulu  |
      | Peserta         | Tambahkan minimal 1 peserta            |

  Skenario: Tanggal selesai mendahului tanggal mulai ditolak
    Ketika saya mengisi Tanggal Mulai "2026-10-15" dan Tanggal Selesai "2026-10-01"
    Dan saya melengkapi field wajib lainnya
    Dan saya menekan tombol submit
    Maka tidak ada kandidat yang tersimpan
    Dan saya melihat pesan "Tanggal Selesai tidak boleh sebelum Tanggal Mulai"

  Skenario: Upload Excel memuat peserta
    Dengan saya berada di sub-tab "Upload Excel"
    Ketika saya mengunggah berkas "peserta.xlsx" berisi 50 baris dengan kolom "Assessee name" dan "Assessee email"
    Maka 50 peserta muncul di preview
    Dan saya melihat ringkasan "peserta.xlsx — 50 peserta dimuat"

  Skenario: Excel tanpa kolom yang dibutuhkan ditolak
    Dengan saya berada di sub-tab "Upload Excel"
    Ketika saya mengunggah berkas yang hanya memiliki kolom "Nama" dan "Telepon"
    Maka tidak ada peserta yang dimuat
    Dan saya melihat pesan "Kolom \"Assessee name\" / \"Assessee email\" tidak ditemukan"

  Skenario: Format berkas selain Excel ditolak
    Dengan saya berada di sub-tab "Upload Excel"
    Ketika saya mengunggah berkas "peserta.csv"
    Maka tidak ada peserta yang dimuat
    Dan saya melihat pesan "Format harus .xlsx atau .xls"

  Skenario: Email duplikat dilewati saat upload
    Dengan preview peserta sudah memuat "budi@example.com"
    Ketika saya mengunggah berkas berisi 10 baris yang 3 di antaranya beremail "budi@example.com"
    Maka hanya 7 peserta baru yang ditambahkan
    Dan ringkasan upload memuat teks "3 duplikat dilewati"

  Skenario: Batas 300 peserta per batch
    Dengan preview peserta sudah memuat 300 orang
    Ketika saya menambahkan satu peserta lagi secara manual
    Maka peserta tersebut tidak ditambahkan
    Dan saya melihat pesan "Batas 300 peserta tercapai"

  Skenario: Input manual menolak email tidak valid
    Dengan saya berada di sub-tab "Input Manual"
    Ketika saya mengisi nama "Budi Santoso" dan email "budi-at-example"
    Dan saya menekan tombol tambah
    Maka peserta tersebut tidak ditambahkan
    Dan saya melihat pesan "Format email tidak valid"

  Skenario: Input manual menolak email yang sudah ada
    Dengan preview peserta sudah memuat "budi@example.com"
    Dan saya berada di sub-tab "Input Manual"
    Ketika saya mengisi nama "Budi S." dan email "budi@example.com"
    Dan saya menekan tombol tambah
    Maka peserta tersebut tidak ditambahkan
    Dan saya melihat pesan "Email sudah ada dalam daftar"
```

---

## E4 · Pelaksanaan Interview

**Sebagai** kandidat
**Saya ingin** menjalani interview AI dengan perangkat yang sudah dipastikan siap
**Supaya** jawaban saya terekam dan tertranskrip dengan benar

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC4.1 | Halaman welcome menampilkan instruksi cara menjawab sebelum interview dimulai | ✅ |
| AC4.2 | Device check memeriksa kamera, mikrofon, dan kompatibilitas browser | ✅ |
| AC4.3 | Interview tidak bisa dimulai sebelum device check lolos | ✅ |
| AC4.4 | AI membacakan pertanyaan dengan sorotan karaoke mengikuti suara | ✅ |
| AC4.5 | Jawaban direkam sebagai video + audio, dan ditranskrip real-time | ✅ |
| AC4.6 | Tersedia fallback input teks manual bila speech recognition tidak didukung browser | ✅ |
| AC4.7 | Timer per pertanyaan mengikuti field `durasi` item (default 120 detik) | ✅ |
| AC4.8 | Jumlah pengulangan jawaban dibatasi `MAX_ATTEMPTS` | ✅ |
| AC4.9 | Progres sesi bertahan saat halaman di-reload | ✅ |
| AC4.10 | Status kandidat berpindah `Assigned → Invited → In Progress → Completed` | 🟡 Belum ada pemicu otomatis |
| AC4.11 | Kandidat yang melewati deadline batch berstatus `Expired` | 🔴 Belum ada penegakan |
| AC4.12 | Hasil interview dipersist ke storage permanen | 🔴 Gap #1 — masih `sessionStorage` |

### Gherkin

```gherkin
# language: id
Fitur: Pelaksanaan Interview
  Sebagai kandidat
  Saya ingin menjalani interview AI dengan perangkat yang sudah dipastikan siap
  Supaya jawaban saya terekam dan tertranskrip dengan benar

  Skenario: Device check menahan interview saat izin kamera ditolak
    Dengan saya membuka halaman device check
    Ketika saya menolak izin akses kamera
    Maka indikator "Kamera" menunjukkan status gagal
    Dan tombol untuk melanjutkan ke interview tidak bisa ditekan

  Skenario: Device check lolos
    Dengan saya membuka halaman device check
    Ketika saya memberi izin akses kamera dan mikrofon
    Maka indikator "Kamera", "Mikrofon", dan "Browser" menunjukkan status siap
    Dan saya bisa melanjutkan ke halaman interview

  Skenario: Menjawab satu pertanyaan
    Dengan saya berada di pertanyaan pertama
    Ketika AI selesai membacakan pertanyaan
    Dan saya menekan tombol mulai menjawab
    Maka perekaman video dimulai
    Dan timer menghitung mundur dari 120 detik
    Dan transkrip jawaban saya muncul secara real-time

  Skenario: Fallback ke input manual
    Dengan browser saya tidak mendukung speech recognition
    Ketika saya memulai jawaban
    Maka area input teks manual ditampilkan
    Dan saya bisa mengetik jawaban saya di sana

  Skenario: Batas pengulangan jawaban
    Dengan saya sudah mengulang jawaban sebanyak batas maksimum
    Ketika saya melihat layar review jawaban
    Maka tombol ulangi tidak lagi tersedia
    Dan saya hanya bisa mengirim jawaban tersebut

  Skenario: Progres bertahan setelah reload
    Dengan saya sudah menyelesaikan 3 dari 8 pertanyaan
    Ketika saya me-reload halaman interview
    Maka saya kembali ke pertanyaan ke-4
    Dan 3 jawaban sebelumnya tidak hilang

  Skenario: Menyelesaikan seluruh interview
    Dengan saya berada di pertanyaan terakhir
    Ketika saya mengirim jawaban terakhir
    Maka status saya berubah menjadi "Completed"
    Dan report AI dibangkitkan untuk saya
```

---

## E5 · Report AI

**Sebagai** admin / kandidat
**Saya ingin** melihat skor AI per aspek terhadap targetnya
**Supaya** kualitas kandidat bisa dinilai secara terukur

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC5.1 | Report memuat satu baris per aspek: level (1–5), label level, target, bobot, dan alasan AI | ✅ |
| AC5.2 | Aspek dengan `level >= target` ditandai tercapai; selebihnya ditandai di bawah target | ✅ |
| AC5.3 | Report menampilkan agregat `achieved / total` dan `avgLevel` | ✅ |
| AC5.4 | Aspek di bawah target dikumpulkan sebagai **focus area** | ✅ |
| AC5.5 | Alasan per aspek bisa dibuka-tutup (detail baris) | ✅ |
| AC5.6 | Kandidat hanya bisa melihat hasilnya sendiri bila `paket.showResult = true` | 🟡 Flag ada, penegakan belum |
| AC5.7 | Report ditandai `ready` dan baru setelah itu bisa ditugaskan ke asesor | ✅ |
| AC5.8 | Aspek yang gagal dinilai bisa di-retry | ✅ |

### Gherkin

```gherkin
# language: id
Fitur: Report AI
  Sebagai admin
  Saya ingin melihat skor AI per aspek terhadap targetnya
  Supaya kualitas kandidat bisa dinilai secara terukur

  Dasar:
    Dengan kandidat "Budi Santoso" sudah menyelesaikan interview
    Dan report AI untuk kandidat tersebut sudah dibangkitkan

  Skenario: Isi report per aspek
    Ketika saya membuka report kandidat "Budi Santoso"
    Maka setiap aspek menampilkan level hasil penilaian AI
    Dan setiap aspek menampilkan target level dari paket
    Dan setiap aspek menampilkan bobotnya
    Dan setiap aspek menyediakan alasan penilaian yang bisa dibuka

  Skenario Konsep: Penandaan tercapai terhadap target
    Dengan aspek "Problem Solving" memiliki target level 4
    Ketika AI memberi level "<level>" pada aspek tersebut
    Maka aspek tersebut ditandai "<penanda>"

    Contoh:
      | level | penanda          |
      | 5     | tercapai         |
      | 4     | tercapai         |
      | 3     | di bawah target  |
      | 1     | di bawah target  |

  Skenario: Agregat report
    Dengan report memuat 6 aspek
    Dan 4 di antaranya mencapai target
    Ketika saya membuka report tersebut
    Maka ringkasan menampilkan "4 dari 6" aspek tercapai
    Dan ringkasan menampilkan rata-rata level dengan satu angka desimal

  Skenario: Focus area dari aspek di bawah target
    Dengan aspek "Negotiation" dan "Resilience" berada di bawah target
    Ketika saya membuka report tersebut
    Maka bagian focus area memuat "Negotiation"
    Dan bagian focus area memuat "Resilience"

  Skenario: Report siap ditugaskan ke asesor
    Ketika report kandidat "Budi Santoso" selesai dibangkitkan
    Maka report tersebut ditandai siap
    Dan kandidat "Budi Santoso" muncul di pool kandidat yang bisa di-assign ke asesor
```

---

## E6 · Assignment Asesor

**Sebagai** admin
**Saya ingin** menugaskan sekelompok kandidat ke seorang asesor beserta SLA-nya
**Supaya** skor AI bisa divalidasi manusia sebelum diserahkan ke klien

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC6.1 | Batch diturunkan dari kombinasi `paketId + batchName` kandidat, bukan entitas tersimpan | ✅ |
| AC6.2 | Setiap batch menampilkan kesiapannya: **Siap** / **Sebagian Siap** / **Belum Siap** | ✅ |
| AC6.3 | Batch berkesiapan **Belum Siap** tidak bisa dipilih, dengan alasan yang dijelaskan | ✅ |
| AC6.4 | Batch yang seluruh kandidatnya sudah ditugaskan tidak bisa dipilih, dengan alasan yang dijelaskan | ✅ |
| AC6.5 | Batch yang masih punya kandidat siap-tugas diurutkan ke atas | ✅ |
| AC6.6 | Daftar kandidat hanya memuat yang report AI-nya siap **dan** belum ditugaskan di batch itu | ✅ |
| AC6.7 | Tersedia pilih-semua kandidat | ✅ |
| AC6.8 | Setiap kandidat menampilkan ringkasan skor AI (`avgLevel`, `achieved/total`) sebagai bahan pertimbangan | ✅ |
| AC6.9 | Nama asesor diinput bebas, dengan saran dari riwayat penugasan sebelumnya | ✅ |
| AC6.10 | Email asesor wajib, divalidasi formatnya, dan menjadi identitas asesor | ✅ |
| AC6.11 | Tanggal Mulai dan Deadline SLA wajib; deadline tidak boleh mendahului tanggal mulai | ✅ |
| AC6.12 | Tombol submit tidak aktif selama form belum lengkap | ✅ |
| AC6.13 | Satu kali submit menghasilkan satu grup penugasan dan N task berstatus `Menunggu` | ✅ |
| AC6.14 | Setelah submit berhasil, batch tetap terpilih agar admin bisa lanjut ke asesor berikutnya | ✅ |
| AC6.15 | Grup penugasan yang sudah dibuat bisa dibatalkan | ✅ |
| AC6.16 | Tab bisa dibuka langsung lewat `assignment.html#asesor` | ✅ |
| AC6.17 | Notifikasi penugasan terkirim ke email asesor | 🔴 Gap #4 |

### Gherkin

```gherkin
# language: id
Fitur: Assignment Asesor
  Sebagai admin
  Saya ingin menugaskan sekelompok kandidat ke seorang asesor beserta SLA-nya
  Supaya skor AI bisa divalidasi manusia sebelum diserahkan ke klien

  Dasar:
    Dengan saya membuka halaman "Assignment" pada tab "Assignment Asesor"

  Skenario Konsep: Penandaan kesiapan batch
    Dengan batch "Batch X" memiliki <total> kandidat
    Dan <siap> di antaranya sudah punya report AI siap
    Ketika saya melihat daftar batch
    Maka batch "Batch X" ditandai "<kesiapan>"

    Contoh:
      | total | siap | kesiapan      |
      | 12    | 12   | Siap          |
      | 10    | 6    | Sebagian Siap |
      | 6     | 0    | Belum Siap    |

  Skenario: Batch tanpa report AI tidak bisa dipilih
    Dengan batch "Interview AI — Key Account Manager" berkesiapan "Belum Siap"
    Ketika saya melihat daftar batch
    Maka batch tersebut tidak bisa dipilih
    Dan saya melihat alasan "Report AI belum tersedia — kandidat belum menyelesaikan interview"

  Skenario: Batch yang sudah habis ditugaskan tidak bisa dipilih
    Dengan seluruh kandidat siap pada batch "Interview AI — Sales Supervisor Q2" sudah ditugaskan
    Ketika saya melihat daftar batch
    Maka batch tersebut tidak bisa dipilih
    Dan saya melihat alasan "Semua kandidat sudah ditugaskan"

  Skenario: Daftar kandidat menyembunyikan yang sudah ditugaskan
    Dengan batch "Interview AI — Sales Hunter Q3" memiliki 18 kandidat siap
    Dan 10 di antaranya sudah ditugaskan ke asesor lain
    Ketika saya memilih batch tersebut
    Maka daftar kandidat menampilkan 8 kandidat
    Dan seluruhnya belum pernah ditugaskan

  Skenario: Menugaskan kandidat ke asesor
    Dengan saya memilih batch "Interview AI — Account Executive Q4"
    Dan saya memilih 5 kandidat
    Ketika saya mengisi data asesor berikut:
      | field         | nilai                      |
      | Nama Asesor   | Dr. Rina Kusumawardani     |
      | Email Asesor  | rina.kusuma@assessor.id    |
      | Tanggal Mulai | 2026-09-15                 |
      | Deadline SLA  | 2026-09-22                 |
    Dan saya menekan tombol submit penugasan
    Maka saya melihat pesan "5 kandidat ditugaskan ke Dr. Rina Kusumawardani"
    Dan 5 task validasi dibuat berstatus "Menunggu"
    Dan seluruh task tersebut berada dalam satu grup penugasan
    Dan batch "Interview AI — Account Executive Q4" tetap terpilih
    Tapi field kandidat, asesor, dan catatan sudah dikosongkan

  Skenario Konsep: Validasi form penugasan
    Dengan saya memilih batch "Interview AI — Account Executive Q4"
    Ketika saya mengirim penugasan dengan kondisi "<kondisi>"
    Maka tidak ada task yang dibuat
    Dan saya melihat pesan "<pesan>"

    Contoh:
      | kondisi                          | pesan                                        |
      | tanpa kandidat terpilih          | Pilih minimal 1 kandidat                     |
      | nama asesor kosong               | Nama asesor wajib diisi                      |
      | email asesor kosong              | Email asesor wajib diisi                     |
      | email asesor "rina-at-mail"      | Format email asesor tidak valid              |
      | tanggal mulai kosong             | Tanggal mulai wajib diisi                    |
      | deadline kosong                  | Deadline SLA wajib diisi                     |
      | deadline mendahului tanggal mulai| Deadline tidak boleh sebelum tanggal mulai   |

  Skenario: Saran asesor berasal dari riwayat, bukan master data
    Dengan asesor "Bagus Prasetyo, M.Psi" pernah ditugaskan sebelumnya
    Ketika saya mengetik "Bagus" pada field nama asesor
    Maka saya melihat saran "Bagus Prasetyo, M.Psi"
    Dan memilih saran tersebut ikut mengisi email asesornya
    Tapi saya tetap bisa mengetik nama asesor baru yang belum pernah ada

  Skenario: Membatalkan grup penugasan
    Dengan terdapat grup penugasan berisi 4 task untuk asesor "Ahmad Fauzi, M.Psi"
    Ketika saya membatalkan grup penugasan tersebut
    Dan saya menyetujui konfirmasi pembatalan
    Maka keempat task tersebut dihapus
    Dan keempat kandidatnya kembali muncul di daftar kandidat yang bisa ditugaskan

  Skenario: Deep link langsung ke tab asesor
    Ketika saya membuka "assignment.html#asesor"
    Maka tab "Assignment Asesor" langsung aktif
    Dan tab "Assignment Kandidat" tidak ditampilkan
```

---

## E7 · Validasi oleh Asesor

> 🔴 **Halaman ini belum dibangun.** Struktur datanya sudah siap (`status`, `revisedAspects`,
> `validatedAt`, `log` di model task) dan Monitoring sudah merendernya — yang belum ada
> adalah layar tempat asesor mengerjakannya. Bagian ini adalah **spesifikasi untuk dibangun**,
> bukan catatan perilaku yang sudah berjalan.

**Sebagai** asesor
**Saya ingin** meninjau skor AI per aspek dan merevisinya bila perlu
**Supaya** report yang diserahkan ke klien bisa dipertanggungjawabkan

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC7.1 | Asesor hanya melihat task yang ditugaskan ke email-nya | 🔴 |
| AC7.2 | Daftar task menampilkan kandidat, batch, deadline, dan sisa waktu SLA | 🔴 |
| AC7.3 | Membuka task pertama kali mengubah status `Menunggu → Sedang Direview` dan mengisi `startedAt` | 🔴 |
| AC7.4 | Asesor bisa membaca transkrip jawaban kandidat per pertanyaan | 🔴 |
| AC7.5 | Asesor bisa melihat rubrik aspek berdampingan dengan level yang diberikan AI | 🔴 |
| AC7.6 | Per aspek, asesor bisa menyetujui level AI **atau** mengubahnya | 🔴 |
| AC7.7 | Mengubah level **wajib** disertai alasan revisi | 🔴 |
| AC7.8 | Submit tanpa perubahan → status `Tervalidasi`, `revisedAspects = 0` | 🔴 |
| AC7.9 | Submit dengan perubahan → status `Direvisi`, `revisedAspects` = jumlah aspek yang diubah | 🔴 |
| AC7.10 | `validatedAt` terisi dan entri baru masuk ke `log` saat submit | 🔴 |
| AC7.11 | Task yang sudah selesai tidak bisa diubah lagi tanpa membukanya kembali secara sengaja | 🔴 |
| AC7.12 | Skor final yang tampil di report adalah hasil revisi asesor, bukan skor AI awal | 🔴 |

### Gherkin

```gherkin
# language: id
Fitur: Validasi oleh Asesor
  Sebagai asesor
  Saya ingin meninjau skor AI per aspek dan merevisinya bila perlu
  Supaya report yang diserahkan ke klien bisa dipertanggungjawabkan

  Dasar:
    Dengan saya masuk sebagai asesor beremail "rina.kusuma@assessor.id"
    Dan saya memiliki 5 task validasi pada batch "Interview AI — Sales Hunter Q3"

  Skenario: Asesor hanya melihat tugasnya sendiri
    Dengan terdapat task lain yang ditugaskan ke "bagus.prasetyo@assessor.id"
    Ketika saya membuka daftar tugas saya
    Maka saya melihat 5 task
    Tapi saya tidak melihat task milik "bagus.prasetyo@assessor.id"

  Skenario: Membuka task mengubah statusnya menjadi Sedang Direview
    Dengan task untuk kandidat "Budi Santoso" berstatus "Menunggu"
    Ketika saya membuka task tersebut
    Maka status task berubah menjadi "Sedang Direview"
    Dan waktu mulai review tercatat

  Skenario: Menyetujui seluruh skor AI tanpa perubahan
    Dengan saya sedang mereview task kandidat "Budi Santoso"
    Ketika saya menyetujui level AI pada seluruh aspek
    Dan saya menekan tombol submit validasi
    Maka status task berubah menjadi "Tervalidasi"
    Dan jumlah aspek yang direvisi adalah 0
    Dan waktu validasi tercatat
    Dan catatan "Skor AI divalidasi tanpa perubahan" masuk ke riwayat task

  Skenario: Merevisi sebagian aspek
    Dengan saya sedang mereview task kandidat "Ani Wijaya"
    Ketika saya mengubah level aspek "Problem Solving" dari 3 menjadi 4
    Dan saya mengisi alasan revisi untuk aspek tersebut
    Dan saya mengubah level aspek "Negotiation" dari 2 menjadi 3
    Dan saya mengisi alasan revisi untuk aspek tersebut
    Dan saya menekan tombol submit validasi
    Maka status task berubah menjadi "Direvisi"
    Dan jumlah aspek yang direvisi adalah 2
    Dan catatan "Skor AI direvisi asesor" masuk ke riwayat task

  Skenario: Revisi tanpa alasan ditolak
    Dengan saya sedang mereview task kandidat "Ani Wijaya"
    Ketika saya mengubah level aspek "Problem Solving" tanpa mengisi alasan revisi
    Dan saya menekan tombol submit validasi
    Maka validasi tidak tersimpan
    Dan saya melihat pesan bahwa alasan revisi wajib diisi

  Skenario: Skor final mengikuti revisi asesor
    Dengan task kandidat "Ani Wijaya" berstatus "Direvisi"
    Dan asesor mengubah level aspek "Problem Solving" dari 3 menjadi 4
    Ketika report final kandidat "Ani Wijaya" dibuka
    Maka aspek "Problem Solving" menampilkan level 4
    Dan report menandai bahwa skor tersebut telah direvisi asesor
```

---

## E8 · Monitoring

**Sebagai** admin
**Saya ingin** memantau progres scoring per batch beserta SLA-nya
**Supaya** saya tahu batch mana yang tersendat sebelum klien menagih

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC8.1 | Satu kartu per batch, memuat badge status scoring, periode, jumlah peserta, dan progress bar | ✅ |
| AC8.2 | Status scoring diturunkan otomatis, bukan diinput manual | ✅ |
| AC8.3 | Batch **overdue** selalu muncul paling atas | ✅ |
| AC8.4 | Urutan berikutnya: Sedang Discoring → Belum Discoring → Belum Siap → Selesai Discoring | ✅ |
| AC8.5 | Kartu bisa dibuka-tutup, dan lebih dari satu kartu boleh terbuka bersamaan | ✅ |
| AC8.6 | Tabel kandidat memuat kolom Peserta, Interview, Asesor, dan Status Validasi | ✅ |
| AC8.7 | Kolom Asesor dan Status Validasi terpisah — Asesor menampilkan avatar + nama, Status Validasi menampilkan badge | ✅ |
| AC8.8 | Kandidat yang belum ditugaskan ditandai `Belum Ditugaskan` dengan kolom asesor kosong | ✅ |
| AC8.9 | Setiap kartu punya pencarian & filter sendiri yang tidak saling memengaruhi | ✅ |
| AC8.10 | KPI di atas halaman merangkum jumlah batch per status scoring, overdue, dan at risk | ✅ |
| AC8.11 | Tersedia tautan langsung ke `assignment.html#asesor` untuk menugaskan asesor | ✅ |
| AC8.12 | Batch dengan SLA tersisa ≤ 2 hari ditandai **At Risk** | ✅ |

### Gherkin

```gherkin
# language: id
Fitur: Monitoring
  Sebagai admin
  Saya ingin memantau progres scoring per batch beserta SLA-nya
  Supaya saya tahu batch mana yang tersendat sebelum klien menagih

  Dasar:
    Dengan saya membuka halaman "Monitoring"

  Skenario Konsep: Status scoring diturunkan dari kondisi batch
    Dengan batch "Batch X" memiliki kondisi "<kondisi>"
    Ketika saya melihat kartu batch tersebut
    Maka badge status scoring menunjukkan "<status>"

    Contoh:
      | kondisi                                          | status            |
      | belum ada report AI sama sekali                  | Belum Siap        |
      | report AI siap tapi belum ada task asesor        | Belum Discoring   |
      | ada task asesor yang belum seluruhnya selesai    | Sedang Discoring  |
      | semua task selesai dan mencakup semua report siap| Selesai Discoring |

  Skenario Konsep: Penandaan SLA
    Dengan batch "Batch X" punya deadline aktif "<deadline>"
    Dan task pada batch tersebut belum seluruhnya selesai
    Ketika saya melihat kartu batch tersebut
    Maka SLA batch ditandai "<state>"

    Contoh:
      | deadline          | state    |
      | kemarin           | Overdue  |
      | besok             | At Risk  |
      | 2 hari lagi       | At Risk  |
      | 10 hari lagi      | On Track |

  Skenario: Batch overdue naik ke urutan teratas
    Dengan terdapat batch berstatus overdue dan batch berstatus on track
    Ketika saya melihat daftar kartu batch
    Maka batch overdue muncul di atas batch on track

  Skenario: Membuka detail batch
    Dengan kartu batch "Interview AI — Sales Hunter Q3" dalam keadaan tertutup
    Ketika saya menekan header kartu tersebut
    Maka tabel kandidat batch tersebut ditampilkan
    Dan tabel memuat kolom "Peserta", "Interview", "Asesor", dan "Status Validasi"

  Skenario: Beberapa kartu bisa terbuka bersamaan
    Dengan kartu batch "Interview AI — Sales Hunter Q3" sudah terbuka
    Ketika saya menekan header kartu "Interview AI — Business Development"
    Maka kedua kartu tersebut terbuka bersamaan

  Skenario: Kandidat yang belum ditugaskan
    Dengan kandidat "Fajar Nugroho" sudah punya report AI siap
    Tapi kandidat tersebut belum ditugaskan ke asesor mana pun
    Ketika saya membuka kartu batch yang memuatnya
    Maka baris "Fajar Nugroho" menampilkan status validasi "Belum Ditugaskan"
    Dan kolom asesor pada baris tersebut kosong

  Skenario Konsep: Status validasi per kandidat
    Dengan kandidat "Budi Santoso" punya task validasi berstatus "<status task>"
    Ketika saya membuka kartu batch yang memuatnya
    Maka baris "Budi Santoso" menampilkan badge "<status task>"
    Dan kolom asesor menampilkan nama asesor yang menanganinya

    Contoh:
      | status task     |
      | Menunggu        |
      | Sedang Direview |
      | Tervalidasi     |
      | Direvisi        |

  Skenario: Pencarian per kartu tidak saling memengaruhi
    Dengan kartu batch "Interview AI — Sales Hunter Q3" dan "Interview AI — Business Development" keduanya terbuka
    Ketika saya mengetik "Budi" pada pencarian kartu "Interview AI — Sales Hunter Q3"
    Maka tabel kartu tersebut hanya menampilkan kandidat yang cocok
    Tapi tabel kartu "Interview AI — Business Development" tidak berubah

  Skenario: Menuju penugasan asesor dari monitoring
    Ketika saya menekan tautan "+ Assign Asesor"
    Maka saya diarahkan ke halaman Assignment
    Dan tab "Assignment Asesor" langsung aktif
```

---

## E9 · Navigasi & Struktur Halaman

### Acceptance Criteria

| # | Kriteria | Status |
|---|---|:---:|
| AC9.1 | Sidebar memuat tepat 4 menu: Item Management, Paket Interview, Assignment, Monitoring | ✅ |
| AC9.2 | Menu yang sedang dibuka ditandai aktif | ✅ |
| AC9.3 | Sidebar bisa diciutkan dan dikembangkan | ✅ |
| AC9.4 | Assignment adalah satu halaman dengan dua tab, bukan dua halaman terpisah | ✅ |
| AC9.5 | Tab dalam Assignment bisa dituju langsung lewat hash URL | ✅ |
| AC9.6 | Tab Excel/Manual di dalam tab Kandidat tidak mengganggu tab Kandidat/Asesor di level halaman | ✅ |
| AC9.7 | Seluruh halaman bebas dari scroll horizontal pada lebar layar normal | ✅ |
| AC9.8 | Tidak ada tautan mati ke halaman yang sudah dipensiunkan | ✅ |

### Gherkin

```gherkin
# language: id
Fitur: Navigasi & Struktur Halaman
  Sebagai admin
  Saya ingin struktur menu yang ringkas dan konsisten
  Supaya saya tidak tersesat antar halaman

  Skenario Konsep: Sidebar konsisten di semua halaman
    Ketika saya membuka halaman "<halaman>"
    Maka sidebar memuat tepat 4 menu
    Dan menu tersebut adalah "Item Management", "Paket Interview", "Assignment", dan "Monitoring"
    Dan menu "<menu aktif>" ditandai aktif

    Contoh:
      | halaman              | menu aktif      |
      | item-management.html | Item Management |
      | assignment.html      | Assignment      |
      | monitoring.html      | Monitoring      |

  Skenario: Berpindah antar tab di halaman Assignment
    Dengan saya membuka halaman "Assignment"
    Maka tab "Assignment Kandidat" aktif secara bawaan
    Ketika saya menekan tab "Assignment Asesor"
    Maka konten Assignment Asesor ditampilkan
    Dan konten Assignment Kandidat disembunyikan

  Skenario: Tab bersarang tidak saling mengganggu
    Dengan saya berada di tab "Assignment Kandidat"
    Ketika saya berpindah dari sub-tab "Upload Excel" ke "Input Manual"
    Maka sub-tab "Input Manual" menjadi aktif
    Dan tab halaman tetap berada di "Assignment Kandidat"

  Skenario: Menciutkan sidebar
    Dengan sidebar dalam keadaan mengembang
    Ketika saya menekan tombol ciutkan sidebar
    Maka sidebar menyempit
    Dan area konten melebar mengisi ruang yang ditinggalkan
```

---

## Ringkasan Cakupan

| Epic | AC total | ✅ | 🟡 | 🔴 |
|---|---:|---:|---:|---:|
| E1 Item Management | 9 | 9 | 0 | 0 |
| E2 Paket Interview | 10 | 10 | 0 | 0 |
| E3 Assignment Kandidat | 13 | 12 | 0 | 1 |
| E4 Pelaksanaan Interview | 12 | 9 | 1 | 2 |
| E5 Report AI | 8 | 7 | 1 | 0 |
| E6 Assignment Asesor | 17 | 16 | 0 | 1 |
| E7 Validasi oleh Asesor | 12 | 0 | 0 | 12 |
| E8 Monitoring | 12 | 12 | 0 | 0 |
| E9 Navigasi | 8 | 8 | 0 | 0 |
| **Total** | **101** | **83** | **2** | **16** |

**Prioritas pembangunan berikutnya**, berdasarkan sebaran 🔴 di atas:

1. **E7 — Halaman Validasi Asesor** (12 AC). Ini satu-satunya epic yang sama sekali kosong, sekaligus mata rantai yang memutus alur end-to-end: tanpa ini, status `Tervalidasi` / `Direvisi` yang sudah dirender Monitoring tidak akan pernah muncul dari aksi nyata.
2. **Persistensi hasil interview** (Gap #1). Prasyarat teknis E7 — asesor tidak bisa memvalidasi report yang tidak pernah tersimpan.
3. **Mekanisme undangan** (AC3.13, AC6.17). Kandidat dan asesor saat ini tidak pernah benar-benar diberi tahu bahwa mereka punya tugas.
