import type { SiteSettings } from './types';

export function downloadCertificate(opts: {
  name: string;
  score: number;
  date: string;
  settings: SiteSettings;
}) {
  const { name, score, date, settings } = opts;
  const win = window.open('', '_blank');
  if (!win) return;

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  win.document.write(`
<!doctype html><html><head><title>Sertifikat ${settings.program_name}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', serif; background: #f0f0f0; padding: 20px; }
  .cert {
    width: 297mm; height: 210mm; margin: 0 auto;
    background: white; border: 12px solid #1f6df0;
    position: relative; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 40px;
  }
  .cert::before {
    content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px;
    border: 2px solid #16a34a; pointer-events: none;
  }
  .logo {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, #1f6df0, #16a34a);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .logo svg { width: 44px; height: 44px; color: white; }
  .title { font-size: 18px; color: #64748b; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px; }
  .program { font-size: 36px; font-weight: bold; color: #1f6df0; margin-bottom: 4px; }
  .subtitle { font-size: 16px; color: #16a34a; margin-bottom: 32px; }
  .body { font-size: 16px; color: #334155; text-align: center; margin-bottom: 24px; }
  .name {
    font-size: 42px; font-weight: bold; color: #0f172a;
    border-bottom: 2px solid #1f6df0; padding: 0 40px 8px; margin-bottom: 24px;
  }
  .score-box {
    display: flex; gap: 48px; margin-bottom: 40px;
  }
  .score-item { text-align: center; }
  .score-item .label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
  .score-item .value { font-size: 28px; font-weight: bold; color: #1f6df0; }
  .footer-row {
    display: flex; justify-content: space-between; width: 80%; margin-top: 20px;
  }
  .sign { text-align: center; }
  .sign .line { border-top: 1px solid #334155; width: 200px; margin-bottom: 4px; padding-top: 32px; }
  .sign .role { font-size: 14px; color: #334155; }
  .sign .name-sign { font-size: 14px; font-weight: bold; color: #334155; }
  .corner { position: absolute; font-size: 10px; color: #94a3b8; }
  .corner.tl { top: 16px; left: 20px; }
  .corner.br { bottom: 16px; right: 20px; }
</style></head>
<body>
<div class="cert">
  <div class="corner tl">${settings.contact_info}</div>
  <div class="corner br">${formattedDate}</div>
  <div class="logo">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  </div>
  <div class="title">Sertifikat Edukasi</div>
  <div class="program">${settings.program_name}</div>
  <div class="subtitle">${settings.program_subtitle}</div>
  <div class="body">Diberikan kepada:</div>
  <div class="name">${name}</div>
  <div class="body">Atas partisipasi dan penyelesaian Quiz Edukasi Hipertensi<br>Program ${settings.program_name} (${settings.program_subtitle})</div>
  <div class="score-box">
    <div class="score-item"><div class="label">Nilai</div><div class="value">${score}</div></div>
    <div class="score-item"><div class="label">Status</div><div class="value">${score >= 70 ? 'LULUS' : 'PARTISIPAN'}</div></div>
    <div class="score-item"><div class="label">Tanggal</div><div class="value" style="font-size:18px">${formattedDate}</div></div>
  </div>
  <div class="footer-row">
    <div class="sign">
      <div class="line"></div>
      <div class="name-sign">Kepala Puskesmas</div>
      <div class="role">${settings.contact_info}</div>
    </div>
    <div class="sign">
      <div class="line"></div>
      <div class="name-sign">Program ${settings.program_name}</div>
      <div class="role">Bersama Kendalikan Hipertensi</div>
    </div>
  </div>
</div>
<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
</body></html>
  `);
  win.document.close();
}
