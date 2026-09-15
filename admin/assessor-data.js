/* ─────────────────────────────────────────────────────────────
   assessor-data.js — data layer bersama untuk Validasi Asesor
   Dipakai oleh: assessor-assignment.html, monitoring.html (batch scoring status,
   konsolidasi dari halaman monitoring asesor terpisah yang sudah tidak ada)
   Butuh: competency-data.js (global FRAMEWORK) di-load lebih dulu.
   Semua state di localStorage. Prototype — tanpa backend.

   CATATAN PENTING: platform belum punya master data / registry asesor.
   Asesor karena itu TIDAK punya id — identitasnya adalah email (di-
   normalkan lowercase), dan namanya diinput bebas oleh admin saat
   menugaskan. Jangan menambahkan kembali konsep kapasitas/registry
   asesor sebelum platform-nya benar-benar punya.
   ───────────────────────────────────────────────────────────── */
const AD = (function () {

  const LS_ITEM = 'admin_item_mgmt_v1';      // master item/paket (existing)
  const LS_CAND = 'admin_assignment_v1';     // assignment kandidat (existing)
  const LS_TASK = 'admin_assessor_task_v1';  // tugas validasi asesor
  const LS_SEED = 'admin_assessor_seed_v1';  // versi data demo yang tersemai

  /* Naikkan angka ini setiap kali DEMO_BATCHES / DEMO_GROUPS diubah.
     Tanpa ini, browser yang sudah pernah membuka halaman akan terus memakai
     data demo versi lama — ensureData() hanya menyemai saat localStorage
     kosong, sehingga seed yang sudah tidak konsisten tidak pernah bisa
     memperbaiki diri sendiri. */
  const SEED_VERSION = 4;

  const PAKET_FALLBACK = { P1: 'Sales Hunter v1', P2: 'Sales Farmer v1' };
  const PAKET_ROLE     = { P1: 'hunter',          P2: 'farmer' };

  /* Status satu tugas validasi (satu kandidat) */
  const TASK_STATUS = {
    MENUNGGU:  'Menunggu',
    REVIEW:    'Sedang Direview',
    VALIDATED: 'Tervalidasi',
    REVISED:   'Direvisi',
  };
  const DONE_STATUS = [TASK_STATUS.VALIDATED, TASK_STATUS.REVISED];

  /* Status scoring satu batch — inti halaman monitoring */
  const SCORING = {
    BELUM_SIAP: 'Belum Siap',        // report AI belum ada, belum bisa discoring
    BELUM:      'Belum Discoring',   // report siap tapi belum ada asesor
    SEDANG:     'Sedang Discoring',
    SELESAI:    'Selesai Discoring',
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ── util ── */
  const clone = o => JSON.parse(JSON.stringify(o));
  const pad2  = n => String(n).padStart(2, '0');

  function readLS(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function writeLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  /** hash stabil dari string → int (untuk mock skor AI yang deterministik) */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /** kunci identitas asesor — email, dinormalkan */
  function assessorKey(email) { return String(email || '').trim().toLowerCase(); }

  /* ── tanggal ── */
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
  function toISODate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
  function offsetISO(n) { return toISODate(addDays(today(), n)); }

  /** selisih hari kalender dari hari ini ke tanggal `iso` (negatif = sudah lewat) */
  function daysUntil(iso) {
    if (!iso) return null;
    const target = new Date(String(iso).slice(0, 10) + 'T00:00:00');
    if (isNaN(target)) return null;
    return Math.round((target - today()) / 86400000);
  }

  function fmtDate(iso) {
    if (!iso) return '–';
    const d = new Date(String(iso).slice(0, 10) + 'T00:00:00');
    if (isNaN(d)) return '–';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function fmtDateTime(iso) {
    if (!iso) return '–';
    const d = new Date(iso);
    if (isNaN(d)) return '–';
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) +
           ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  /* ── kandidat (key existing — bentuknya inkonsisten di repo) ──
     assignment.html / assignment-create.html menulis ARRAY flat,
     monitoring.html membaca {assignments:[]}. readCandidates()
     menerima keduanya; writeCandidates() mempertahankan bentuk asli
     supaya halaman lama tidak rusak. */
  function candShapeIsObject() {
    const raw = readLS(LS_CAND, null);
    return !!raw && !Array.isArray(raw) && typeof raw === 'object';
  }

  function readCandidates() {
    const raw = readLS(LS_CAND, []);
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.assignments)) return raw.assignments;
    return [];
  }

  function writeCandidates(list) {
    if (candShapeIsObject()) {
      const raw = readLS(LS_CAND, {});
      raw.assignments = list;
      writeLS(LS_CAND, raw);
    } else {
      writeLS(LS_CAND, list);
    }
  }

  function paketName(paketId) {
    const db = readLS(LS_ITEM, null);
    const p = db && Array.isArray(db.paket) ? db.paket.find(x => x.id === paketId) : null;
    return (p && p.nama) || PAKET_FALLBACK[paketId] || paketId || '–';
  }

  function roleOf(paketId) { return PAKET_ROLE[paketId] || 'hunter'; }

  /* ── tugas validasi ── */
  function readTasks() {
    const db = readLS(LS_TASK, null);
    return db && Array.isArray(db.tasks) ? db.tasks : [];
  }
  function writeTasks(list, seq) {
    const prev = readLS(LS_TASK, {});
    writeLS(LS_TASK, { tasks: list, seq: seq != null ? seq : (prev.seq || list.length + 1) });
  }
  function nextSeq() { const db = readLS(LS_TASK, {}); return db.seq || 1; }

  /** Asesor yang pernah dipakai — untuk saran autocomplete di form.
      Ini BUKAN registry: hanya riwayat dari penugasan yang sudah ada. */
  function assessorSuggestions() {
    const seen = {};
    readTasks().forEach(t => {
      const k = assessorKey(t.assessorEmail);
      if (k && !seen[k]) seen[k] = { nama: t.assessorName, email: t.assessorEmail };
    });
    return Object.values(seen).sort((a, b) => String(a.nama).localeCompare(String(b.nama)));
  }

  /* ── skor AI mock (deterministik per kandidat) ──
     Repo asli menyimpan hasil interview di sessionStorage saja dan tidak
     pernah dipersist, jadi tidak ada report yang bisa divalidasi asesor.
     Untuk prototype, report dibangkitkan stabil dari id kandidat agar
     angkanya tidak berubah setiap reload. */
  function buildAiReport(candId, paketId) {
    const role = roleOf(paketId);
    const roleData = (typeof FRAMEWORK !== 'undefined' && FRAMEWORK.roles[role]) || null;
    const codes = roleData ? roleData.aspects : ['PS', 'PR', 'IN'];
    const seed  = hash(candId);

    const results = codes.map((code, i) => {
      const target = roleData ? roleData.targets[code] : 4;
      const jitter = ((seed >> (i * 3)) % 5) - 2;          // -2..2
      const level  = Math.max(1, Math.min(5, target + jitter));
      const label  = (typeof FRAMEWORK !== 'undefined' && FRAMEWORK.levelLabels[level - 1]) || '–';
      const aspect = (typeof FRAMEWORK !== 'undefined' && FRAMEWORK.aspects[code]) || null;
      return {
        aspect: code,
        aspectName: aspect ? aspect.name : code,
        level, label, target,
        weight: roleData ? roleData.weights[code] : 'Sedang',
        rationale: 'Penilaian AI berdasarkan transkrip jawaban kandidat pada aspek ini.',
      };
    });

    const achieved = results.filter(r => r.level >= r.target).length;
    const avgLevel = results.reduce((s, r) => s + r.level, 0) / results.length;

    return {
      ready: true,
      role,
      generatedAt: new Date(Date.now() - (seed % 72) * 3600000).toISOString(),
      results,
      achieved,
      total: results.length,
      avgLevel: Math.round(avgLevel * 10) / 10,
    };
  }

  /* ── batch: kandidat dikelompokkan per (paketId + batchName) ── */
  function batchIdOf(c) { return 'b_' + (c.paketId || 'x') + '_' + slug(c.batchName || 'tanpa-nama'); }

  /**
   * Semua batch beserta kesiapannya untuk di-assign ke asesor.
   * readiness: 'Siap' (semua report AI ready) | 'Sebagian Siap' | 'Belum Siap'
   */
  function batches() {
    const cands = readCandidates();
    const tasks = readTasks();
    const byBatch = {};

    cands.forEach(c => {
      const id = batchIdOf(c);
      if (!byBatch[id]) {
        byBatch[id] = {
          id,
          batchName: c.batchName || '(tanpa nama)',
          paketId: c.paketId,
          paketName: c.paketName || paketName(c.paketId),
          periodStart: c.periodStart,
          periodEnd: c.periodEnd,
          candidates: [],
        };
      }
      byBatch[id].candidates.push(c);
    });

    return Object.values(byBatch).map(b => {
      const total       = b.candidates.length;
      const completed   = b.candidates.filter(c => c.status === 'Completed').length;
      const reportReady = b.candidates.filter(c => c.aiReport && c.aiReport.ready).length;

      const assignedIds = new Set(
        tasks.filter(t => t.batchId === b.id).map(t => t.candidateId)
      );
      const assignable = b.candidates.filter(
        c => c.aiReport && c.aiReport.ready && !assignedIds.has(c.id)
      );

      let readiness = 'Belum Siap';
      if (reportReady > 0 && reportReady === total) readiness = 'Siap';
      else if (reportReady > 0)                     readiness = 'Sebagian Siap';

      return Object.assign(b, {
        total, completed, reportReady,
        assignedCount: assignedIds.size,
        assignableCount: assignable.length,
        assignable,
        readiness,
      });
    }).sort((a, b) => {
      // yang bisa langsung ditugaskan naik ke atas, lalu urut kesiapan, lalu nama
      const rank = { 'Siap': 0, 'Sebagian Siap': 1, 'Belum Siap': 2 };
      return (b.assignableCount > 0) - (a.assignableCount > 0) ||
             rank[a.readiness] - rank[b.readiness] ||
             String(a.batchName).localeCompare(String(b.batchName));
    });
  }

  function batchById(id) { return batches().find(b => b.id === id) || null; }

  /* ── SLA ── */
  const AT_RISK_DAYS = 2;

  /**
   * State SLA sekumpulan tugas.
   * done >= total → 'done'; lewat deadline → 'overdue';
   * <= 2 hari → 'atrisk'; sisanya 'ontrack'.
   */
  function slaState(slaDue, done, total) {
    const days = daysUntil(slaDue);
    if (total > 0 && done >= total) return { key: 'done', label: 'Selesai', days };
    if (days == null)               return { key: 'ontrack', label: 'On Track', days: null };
    if (days < 0)                   return { key: 'overdue', label: 'Overdue', days };
    if (days <= AT_RISK_DAYS)       return { key: 'atrisk',  label: 'At Risk', days };
    return { key: 'ontrack', label: 'On Track', days };
  }

  /** teks sisa waktu manusiawi */
  function slaCountdown(sla) {
    if (!sla || sla.days == null) return '–';
    if (sla.key === 'done')  return 'selesai';
    if (sla.days < 0)        return `lewat ${Math.abs(sla.days)} hari`;
    if (sla.days === 0)      return 'jatuh tempo hari ini';
    return `${sla.days} hari lagi`;
  }

  /* ── grup penugasan: satu kali submit = satu groupId ── */
  function groups() {
    const tasks = readTasks();
    const byGroup = {};
    tasks.forEach(t => {
      const g = t.groupId || ('g_' + assessorKey(t.assessorEmail) + '_' + t.batchId);
      if (!byGroup[g]) {
        byGroup[g] = {
          groupId: g,
          assessorName: t.assessorName,
          assessorEmail: t.assessorEmail,
          batchId: t.batchId,
          batchName: t.batchName,
          paketId: t.paketId,
          paketName: t.paketName,
          slaStart: t.slaStart,
          slaDue: t.slaDue,
          assignedAt: t.assignedAt,
          note: t.note,
          tasks: [],
        };
      }
      byGroup[g].tasks.push(t);
    });

    return Object.values(byGroup).map(g => {
      const total  = g.tasks.length;
      const done   = g.tasks.filter(t => DONE_STATUS.includes(t.status)).length;
      const review = g.tasks.filter(t => t.status === TASK_STATUS.REVIEW).length;
      return Object.assign(g, {
        total, done, review,
        pct: total ? Math.round((done / total) * 100) : 0,
        sla: slaState(g.slaDue, done, total),
      });
    }).sort((a, b) => String(a.slaDue).localeCompare(String(b.slaDue)));
  }

  /**
   * BARIS UTAMA HALAMAN MONITORING — satu baris per batch.
   * Menjawab: batch ini sudah discoring atau belum, dan kalau sedang/sudah,
   * siapa asesornya.
   */
  function batchRows() {
    const tasks = readTasks();
    const gs    = groups();

    return batches().map(b => {
      const bt     = tasks.filter(t => t.batchId === b.id);
      const done   = bt.filter(t => DONE_STATUS.includes(t.status)).length;
      const review = bt.filter(t => t.status === TASK_STATUS.REVIEW).length;

      // asesor yang terlibat di batch ini, diringkas per orang
      const byAssessor = {};
      bt.forEach(t => {
        const k = assessorKey(t.assessorEmail) || slug(t.assessorName || 'tanpa-nama');
        if (!byAssessor[k]) {
          byAssessor[k] = { nama: t.assessorName, email: t.assessorEmail, total: 0, done: 0 };
        }
        byAssessor[k].total++;
        if (DONE_STATUS.includes(t.status)) byAssessor[k].done++;
      });

      let scoringStatus;
      if (b.reportReady === 0)                                      scoringStatus = SCORING.BELUM_SIAP;
      else if (!bt.length)                                          scoringStatus = SCORING.BELUM;
      else if (done === bt.length && bt.length === b.reportReady)   scoringStatus = SCORING.SELESAI;
      else                                                          scoringStatus = SCORING.SEDANG;

      // deadline aktif paling dekat di batch ini
      const activeDues = bt.filter(t => !DONE_STATUS.includes(t.status))
                           .map(t => t.slaDue).filter(Boolean).sort();
      const slaDue = activeDues[0] || null;

      return Object.assign({}, b, {
        tasks: bt,
        scored: done,
        inReview: review,
        belumDiscoring: Math.max(0, b.reportReady - bt.length),
        scoringStatus,
        assessors: Object.values(byAssessor),
        groups: gs.filter(g => g.batchId === b.id),
        slaDue,
        sla: slaState(slaDue, done, bt.length),
        pct: bt.length ? Math.round((done / bt.length) * 100) : 0,
      });
    }).sort((a, b) => {
      // yang bermasalah dulu, lalu yang sedang berjalan, lalu belum, selesai terakhir
      const rank = {
        [SCORING.SEDANG]: 0, [SCORING.BELUM]: 1,
        [SCORING.BELUM_SIAP]: 2, [SCORING.SELESAI]: 3,
      };
      return (a.sla.key === 'overdue' ? 0 : 1) - (b.sla.key === 'overdue' ? 0 : 1) ||
             rank[a.scoringStatus] - rank[b.scoringStatus] ||
             String(a.batchName).localeCompare(String(b.batchName));
    });
  }

  function batchRowById(id) { return batchRows().find(b => b.id === id) || null; }

  /* ── KPI monitoring (per batch) ── */
  function monitoringKpi() {
    const rows  = batchRows();
    const tasks = readTasks();
    const count = st => rows.filter(r => r.scoringStatus === st).length;
    return {
      totalBatch:       rows.length,
      belumDiscoring:   count(SCORING.BELUM),
      sedangDiscoring:  count(SCORING.SEDANG),
      selesaiDiscoring: count(SCORING.SELESAI),
      belumSiap:        count(SCORING.BELUM_SIAP),
      overdue:          rows.filter(r => r.sla.key === 'overdue').length,
      atRisk:           rows.filter(r => r.sla.key === 'atrisk').length,
      kandidatDitugaskan: tasks.length,
      kandidatSelesai:  tasks.filter(t => DONE_STATUS.includes(t.status)).length,
      totalAsesor:      assessorSuggestions().length,
    };
  }

  /* ── aksi: buat penugasan ── */
  /**
   * Assign sekumpulan kandidat dari satu batch ke satu asesor.
   * Asesor diinput bebas (nama + email) karena platform belum punya registry.
   * @returns {{ok:boolean, msg:string, created:number, groupId?:string}}
   */
  function assign({ batchId, candidateIds, assessorName, assessorEmail, slaStart, slaDue, note }) {
    const batch = batchById(batchId);
    if (!batch) return { ok: false, msg: 'Batch tidak ditemukan', created: 0 };

    const nama  = String(assessorName || '').trim();
    const email = String(assessorEmail || '').trim();

    if (!candidateIds || !candidateIds.length) return { ok: false, msg: 'Pilih minimal 1 kandidat', created: 0 };
    if (!nama)  return { ok: false, msg: 'Nama asesor wajib diisi', created: 0 };
    if (!email) return { ok: false, msg: 'Email asesor wajib diisi', created: 0 };
    if (!EMAIL_RE.test(email)) return { ok: false, msg: 'Format email asesor tidak valid', created: 0 };
    if (!slaStart) return { ok: false, msg: 'Tanggal mulai wajib diisi', created: 0 };
    if (!slaDue)   return { ok: false, msg: 'Deadline SLA wajib diisi', created: 0 };
    if (slaDue < slaStart) return { ok: false, msg: 'Deadline tidak boleh sebelum tanggal mulai', created: 0 };

    const tasks = readTasks();
    const seq   = nextSeq();
    const now   = new Date().toISOString();
    const alreadyAssigned = new Set(
      tasks.filter(t => t.batchId === batchId).map(t => t.candidateId)
    );

    const picked = batch.candidates.filter(
      c => candidateIds.includes(c.id) && c.aiReport && c.aiReport.ready && !alreadyAssigned.has(c.id)
    );
    if (!picked.length) {
      return { ok: false, msg: 'Kandidat terpilih sudah di-assign atau report AI belum siap', created: 0 };
    }

    const groupId = 'g' + seq + '_' + slug(email) + '_' + batchId;

    picked.forEach((c, i) => {
      tasks.push({
        id: 'VT' + (seq + i),
        groupId,
        assessorName: nama,
        assessorEmail: email,
        batchId,
        batchName: batch.batchName,
        paketId: batch.paketId,
        paketName: batch.paketName,
        candidateId: c.id,
        candidateName: c.nama,
        candidateEmail: c.email,
        aiSummary: {
          achieved: c.aiReport.achieved,
          total: c.aiReport.total,
          avgLevel: c.aiReport.avgLevel,
        },
        status: TASK_STATUS.MENUNGGU,
        assignedAt: now,
        slaStart,
        slaDue,
        note: note || '',
        startedAt: null,
        validatedAt: null,
        revisedAspects: 0,
        log: [{ ts: now, msg: `Ditugaskan ke ${nama} (${email}) · deadline ${fmtDate(slaDue)}` }],
      });
    });

    writeTasks(tasks, seq + picked.length);
    return { ok: true, msg: `${picked.length} kandidat ditugaskan ke ${nama}`, created: picked.length, groupId };
  }

  /** batalkan satu grup penugasan */
  function cancelGroup(groupId) {
    const tasks = readTasks();
    const keep  = tasks.filter(t => t.groupId !== groupId);
    const removed = tasks.length - keep.length;
    writeTasks(keep, nextSeq());
    return removed;
  }

  /* ─────────── SEED DATA DEMO ───────────
     Repo tidak punya kandidat berstatus Completed maupun report AI
     tersimpan, sehingga tanpa seed halaman ini kosong total. */

  const DEMO_ASSESSORS = [
    { nama: 'Dr. Rina Kusumawardani', email: 'rina.kusuma@assessor.id' },
    { nama: 'Bagus Prasetyo, M.Psi',  email: 'bagus.prasetyo@assessor.id' },
    { nama: 'Sari Dewi Anggraini',    email: 'sari.dewi@assessor.id' },
    { nama: 'Ahmad Fauzi, M.Psi',     email: 'ahmad.fauzi@assessor.id' },
  ];

  const NAMA_DEPAN = ['Budi','Ani','Dimas','Rani','Fajar','Siti','Yoga','Nadia','Rizky','Putri','Hendra','Maya','Arif','Dewi','Bayu','Intan','Galih','Laras','Tomi','Sinta','Reza','Wulan','Doni','Asri','Iqbal','Mira','Yudi','Tari','Bima','Novi','Agus','Lia','Edi','Rina','Fikri','Ayu'];
  const NAMA_BELAKANG = ['Santoso','Wijaya','Pratama','Lestari','Nugroho','Maharani','Saputra','Anggraini','Hidayat','Permata','Kurniawan','Safitri','Ramadhan','Puspita','Wibowo','Handayani','Setiawan','Utami'];

  function demoName(i) {
    const d = NAMA_DEPAN.length, b = NAMA_BELAKANG.length;
    // +floor(i/d) menggeser nama belakang tiap kali nama depan mengulang,
    // supaya tidak ada dua kandidat bernama sama persis
    return NAMA_DEPAN[i % d] + ' ' + NAMA_BELAKANG[(i * 7 + Math.floor(i / d)) % b];
  }

  /** definisi batch demo: berapa kandidat yang report AI-nya sudah siap.
      CATATAN: DEMO_GROUPS menunjuk batch lewat indeks (batchIdx), jadi batch baru
      harus DITAMBAHKAN DI AKHIR — menyisipkan di tengah akan menggeser penugasan. */
  const DEMO_BATCHES = [
    { batchName: 'Interview AI — Sales Hunter Q3',       paketId: 'P1', jumlah: 18, ready: 18, startOffset: -30, endOffset: -12 },
    { batchName: 'Interview AI — Business Development',  paketId: 'P2', jumlah: 14, ready: 14, startOffset: -24, endOffset: -8  },
    { batchName: 'Interview AI — Sales Farmer Q3',       paketId: 'P2', jumlah: 10, ready: 6,  startOffset: -14, endOffset: 3   },
    { batchName: 'Interview AI — Key Account Manager',   paketId: 'P1', jumlah: 6,  ready: 0,  startOffset: -4,  endOffset: 10  },
    // Batch bersih: report AI siap seluruhnya, belum ada penugasan asesor —
    // titik masuk paling jelas untuk mencoba alur assignment.
    { batchName: 'Interview AI — Account Executive Q4',  paketId: 'P1', jumlah: 12, ready: 12, startOffset: -9,  endOffset: -1  },
    { batchName: 'Interview AI — Sales Manager Q4',      paketId: 'P2', jumlah: 9,  ready: 9,  startOffset: -7,  endOffset: -2  },
    // Batch yang scoring-nya sudah tuntas — contoh "Selesai Discoring".
    { batchName: 'Interview AI — Sales Supervisor Q2',   paketId: 'P2', jumlah: 8,  ready: 8,  startOffset: -40, endOffset: -20 },
  ];

  /* Sengaja TIDAK menghabiskan seluruh kandidat siap di tiap batch, supaya
     masih ada pool yang bisa ditugaskan saat halaman assignment dibuka.
     asrIdx menunjuk DEMO_ASSESSORS. */
  const DEMO_GROUPS = [
    { asrIdx: 1, batchIdx: 0, from: 0, count: 6, startOffset: -9,  dueOffset: -2, doneCount: 4, revised: 1 }, // overdue
    { asrIdx: 0, batchIdx: 0, from: 6, count: 4, startOffset: -5,  dueOffset:  2, doneCount: 2, revised: 1 }, // at risk
    { asrIdx: 0, batchIdx: 1, from: 0, count: 3, startOffset: -3,  dueOffset: 10, doneCount: 0, revised: 0 }, // lintas batch
    { asrIdx: 2, batchIdx: 1, from: 3, count: 4, startOffset: -6,  dueOffset:  8, doneCount: 4, revised: 2 },
    { asrIdx: 3, batchIdx: 2, from: 0, count: 2, startOffset: -4,  dueOffset: 15, doneCount: 1, revised: 0 }, // on track
    { asrIdx: 2, batchIdx: 6, from: 0, count: 8, startOffset: -16, dueOffset: -9, doneCount: 8, revised: 3 }, // selesai tuntas
  ];

  function genToken(seed) {
    const c = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let out = '', h = hash(seed);
    for (let i = 0; i < 16; i++) { out += c[h % c.length]; h = Math.floor(h / 3) + 17 * (i + 1); }
    return out;
  }

  function buildDemoCandidates() {
    const list = [];
    let n = 0;

    DEMO_BATCHES.forEach((b, bi) => {
      const periodStart = offsetISO(b.startOffset) + 'T08:00:00';
      const periodEnd   = offsetISO(b.endOffset)   + 'T17:00:00';

      for (let i = 0; i < b.jumlah; i++) {
        const id      = 'DEMO_' + bi + '_' + i;
        const nama    = demoName(n++);
        const isReady = i < b.ready;

        // yang belum siap: sebagian sedang berjalan, sebagian baru diundang
        let status = 'Completed';
        if (!isReady) status = (i % 2 === 0) ? 'In Progress' : 'Invited';

        const cand = {
          id,
          paketId: b.paketId,
          paketName: paketName(b.paketId),
          batchName: b.batchName,
          periodStart, periodEnd,
          deadline: periodEnd,
          subdomain: 'app',
          clusters: [],
          nama,
          email: slug(nama).replace(/-/g, '.') + '@example.com',
          wa: '',
          lang: 'id',
          token: genToken(id),
          status,
          channel: 'seed',
          createdAt: new Date(new Date(periodStart).getTime()).toISOString(),
          updatedAt: new Date().toISOString(),
          log: [{ ts: new Date(periodStart).toISOString(), msg: 'Assigned via batch: ' + b.batchName }],
        };

        if (isReady) {
          cand.aiReport    = buildAiReport(id, b.paketId);
          cand.completedAt = cand.aiReport.generatedAt;
        }
        list.push(cand);
      }
    });
    return list;
  }

  function buildDemoTasks(cands) {
    const tasks = [];
    let seq = 1;

    DEMO_GROUPS.forEach((g, gi) => {
      const def     = DEMO_BATCHES[g.batchIdx];
      const asr     = DEMO_ASSESSORS[g.asrIdx];
      const batchId = 'b_' + def.paketId + '_' + slug(def.batchName);

      const pool = cands.filter(
        c => c.batchName === def.batchName && c.aiReport && c.aiReport.ready
      ).slice(g.from, g.from + g.count);

      // startOffset selalu negatif supaya assignedAt/validatedAt tidak jatuh di masa depan
      const slaDue   = offsetISO(g.dueOffset);
      const slaStart = offsetISO(g.startOffset);
      const groupId  = 'g' + (gi + 1) + '_' + slug(asr.email) + '_' + batchId;

      pool.forEach((c, i) => {
        const isDone    = i < g.doneCount;
        const isRevised = isDone && i < g.revised;
        const inReview  = !isDone && i === g.doneCount;

        let status = TASK_STATUS.MENUNGGU;
        if (isRevised)     status = TASK_STATUS.REVISED;
        else if (isDone)   status = TASK_STATUS.VALIDATED;
        else if (inReview) status = TASK_STATUS.REVIEW;

        const assignedAt = new Date(new Date(slaStart + 'T09:00:00').getTime()).toISOString();
        const log = [{ ts: assignedAt, msg: `Ditugaskan ke ${asr.nama} (${asr.email}) · deadline ${fmtDate(slaDue)}` }];
        let validatedAt = null;

        if (isDone) {
          validatedAt = new Date(new Date(slaStart + 'T09:00:00').getTime() + (i + 1) * 26 * 3600000).toISOString();
          log.push({ ts: validatedAt, msg: isRevised ? 'Skor AI direvisi asesor' : 'Skor AI divalidasi tanpa perubahan' });
        } else if (inReview) {
          log.push({ ts: new Date(new Date(slaStart + 'T09:00:00').getTime() + 3600000).toISOString(), msg: 'Asesor mulai mereview' });
        }

        tasks.push({
          id: 'VT' + seq++,
          groupId,
          assessorName: asr.nama,
          assessorEmail: asr.email,
          batchId,
          batchName: def.batchName,
          paketId: def.paketId,
          paketName: paketName(def.paketId),
          candidateId: c.id,
          candidateName: c.nama,
          candidateEmail: c.email,
          aiSummary: {
            achieved: c.aiReport.achieved,
            total: c.aiReport.total,
            avgLevel: c.aiReport.avgLevel,
          },
          status,
          assignedAt,
          slaStart, slaDue,
          note: '',
          startedAt: inReview || isDone ? assignedAt : null,
          validatedAt,
          revisedAspects: isRevised ? (1 + (hash(c.id) % 3)) : 0,
          log,
        });
      });
    });

    return { tasks, seq };
  }

  /**
   * Seed data demo. `force` menimpa data yang ada.
   * Tanpa force: hanya mengisi yang masih kosong.
   */
  function seedDemo(force) {
    const existing = readCandidates();
    const hasDemo  = existing.some(c => c.channel === 'seed');
    let cands = existing;

    if (force || !hasDemo) {
      const kept = existing.filter(c => c.channel !== 'seed');
      cands = kept.concat(buildDemoCandidates());
      writeCandidates(cands);
    }

    if (force || !readTasks().length) {
      const built = buildDemoTasks(cands);
      writeTasks(built.tasks, built.seq);
    }
  }

  /** hapus semua data demo (kandidat seed + tugas validasi).
      Kandidat non-seed — mis. yang dibuat lewat assignment.html — dipertahankan. */
  function resetDemo() {
    writeCandidates(readCandidates().filter(c => c.channel !== 'seed'));
    localStorage.removeItem(LS_TASK);
    localStorage.removeItem(LS_SEED);
  }

  /** pastikan ada data untuk dilihat; dipanggil di awal tiap halaman */
  function ensureData() {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(LS_SEED)); } catch (e) {}

    if (!stored || stored.version !== SEED_VERSION) {
      // Browser ini menyimpan data demo dari versi kode yang berbeda (atau belum
      // punya penanda versi sama sekali). Data seperti itu bisa sudah tidak
      // konsisten dengan aturan sekarang, jadi semai ulang alih-alih dibiarkan.
      resetDemo();
      seedDemo(true);
      writeLS(LS_SEED, { version: SEED_VERSION, seededAt: new Date().toISOString() });
      return;
    }

    if (!readTasks().length ||
        !readCandidates().some(c => c.aiReport && c.aiReport.ready)) {
      seedDemo(false);
      writeLS(LS_SEED, { version: SEED_VERSION, seededAt: new Date().toISOString() });
    }
  }

  /* ── html escape ── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return {
    LS_ITEM, LS_CAND, LS_TASK,
    TASK_STATUS, DONE_STATUS, SCORING, AT_RISK_DAYS, EMAIL_RE,
    // io
    readCandidates, writeCandidates, readTasks,
    // batch
    batches, batchById, batchRows, batchRowById,
    // asesor (tanpa registry — hanya riwayat pemakaian)
    assessorSuggestions, assessorKey,
    // grup & monitoring
    groups, monitoringKpi,
    // sla
    slaState, slaCountdown, daysUntil,
    // aksi
    assign, cancelGroup,
    // seed
    seedDemo, resetDemo, ensureData,
    // util
    paketName, roleOf, fmtDate, fmtDateTime, toISODate, offsetISO, today, addDays, esc, slug, hash,
  };
})();
