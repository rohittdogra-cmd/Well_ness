/** The server clock controls launch; only explicitly configured hosts are gated. */
export function launchGate(hostname, launchAt = "", hosts = "", now = Date.now()) {
  const opensAt = Date.parse(launchAt);
  const gatedHosts = hosts.split(",").map((host) => host.trim().toLowerCase());
  if (!gatedHosts.includes(hostname.toLowerCase()) || !Number.isFinite(opensAt) || now >= opensAt) return null;
  const time = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).format(opensAt);
  const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric" }).format(opensAt);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="60"><title>Stress &amp; Unwind — Opening soon</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#f2f7f1;color:#193f36;font-family:system-ui,-apple-system,sans-serif;padding:24px}main{max-width:700px;text-align:center;padding:56px 28px}header{font-size:16px;font-weight:700;letter-spacing:.08em}.flower{display:block;font-size:68px;margin:46px 0 22px;color:#679b67}h1{font-size:clamp(42px,8vw,72px);line-height:1.06;letter-spacing:-.055em;margin:0 0 24px}p{font-size:18px;line-height:1.7;color:#526b60}.time{display:block;font-size:24px;font-weight:650;margin-top:28px}time{display:block;margin-top:8px;color:#526b60}#countdown{font-variant-numeric:tabular-nums;font-size:38px;letter-spacing:.06em;font-weight:600;margin:36px 0 8px}small{color:#526b60;line-height:1.6;display:block}footer{margin-top:48px;font-size:13px;color:#526b60}
  </style></head><body><main><header>STRESS &amp; UNWIND</header><span class="flower" aria-hidden="true">✳</span><h1>A little pause.<br>A fresh beginning.</h1><p>Your people, your interests, and a little more room to recharge.<br>Our wellness hub opens soon.</p><span class="time">${time.toUpperCase()} IST</span><time datetime="${new Date(opensAt).toISOString()}">${date}</time><div id="countdown" role="timer" aria-label="Time until launch">Opening soon</div><small>This page will open the hub automatically when we launch.</small><footer>Make time for yourself. Make room for connection.</footer></main><script>
  const opensAt=${opensAt},serverNow=${now},started=performance.now();
  function tick(){const ms=Math.max(0,opensAt-(serverNow+performance.now()-started));if(ms===0){location.reload();return;}const s=Math.ceil(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60);document.getElementById('countdown').textContent=[h,m,s%60].map(n=>String(n).padStart(2,'0')).join(' : ');}
  tick();setInterval(tick,250);
  </script></body></html>`;
}
