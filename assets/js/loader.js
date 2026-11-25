/* loader.js — memuat komponen HTML + logika hamburger menu */
async function loadComponent(placeholderId, url) {
  const el = document.getElementById(placeholderId)
  if (!el) return false
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(res.status + ' ' + res.statusText)
    el.innerHTML = await res.text()
    return true
  } catch (err) {
    console.error('Gagal memuat ' + url + ':', err)
    el.innerHTML = '<p style="padding:16px">Komponen gagal dimuat. Jalankan lewat server lokal (mis. Live Server).</p>'
    return false
  }
}

function initNavbar() {
  const toggle = document.getElementById('nav-toggle')
  const menu = document.getElementById('nav-menu')
  if (!toggle || !menu) return

  const setOpen = (open) => {
    menu.classList.toggle('open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu')
  }

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')))
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false)
  })
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) setOpen(false)
  })
}

function markActiveLink() {
  const here = location.pathname.split('/').pop() || 'index.html'
  document.querySelectorAll('#nav-menu a').forEach((a) => {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page')
  })
}

function initWaForm() {
  const form = document.getElementById('wa-form')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const d = new FormData(form)
    const text =
      "Assalamu'alaikum, saya ingin bertanya soal PPDB MA Bumi Shalawat.\n" + 'Nama calon santri: ' + d.get('nama') + '\nAsal sekolah: ' + d.get('asal') + '\nNama wali: ' + d.get('wali') + '\nPertanyaan: ' + (d.get('pesan') || '-')
    window.open('https://wa.me/6280000000000?text=' + encodeURIComponent(text), '_blank', 'noopener')
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initWaForm()
  const [navOk, footerOk] = await Promise.all([loadComponent('navbar-placeholder', 'components/navbar.html'), loadComponent('footer-placeholder', 'components/footer.html')])
  if (navOk) {
    initNavbar()
    markActiveLink()
  }
  if (footerOk) {
    const y = document.getElementById('year')
    if (y) y.textContent = new Date().getFullYear()
  }
})

function initGallery() {
  const grid = document.getElementById('galeri-grid')
  if (!grid) return
  const shots = [...grid.querySelectorAll('.shot')]
  const btns = document.querySelectorAll('.filter-btn')
  const visible = () => shots.filter((s) => !s.hidden)

  // Filter kategori
  btns.forEach((b) =>
    b.addEventListener('click', () => {
      const f = b.dataset.filter
      btns.forEach((x) => {
        x.classList.toggle('is-active', x === b)
        x.setAttribute('aria-pressed', String(x === b))
      })
      shots.forEach((s) => {
        s.hidden = f !== 'all' && s.dataset.cat !== f
      })
    })
  )

  // Lightbox (elemen <dialog> bawaan: Esc menutup, fokus terkunci)
  const dlg = document.createElement('dialog')
  dlg.className = 'lightbox'
  dlg.setAttribute('aria-label', 'Tampilan foto besar')
  dlg.innerHTML =
    '<div class="lb-media"></div><p class="lb-caption"></p>' +
    '<div class="lb-controls"><button type="button" class="lb-btn" data-lb="prev" aria-label="Foto sebelumnya">&larr;</button>' +
    '<button type="button" class="lb-btn" data-lb="close">Tutup</button>' +
    '<button type="button" class="lb-btn" data-lb="next" aria-label="Foto berikutnya">&rarr;</button></div>'
  document.body.appendChild(dlg)
  const media = dlg.querySelector('.lb-media')
  const caption = dlg.querySelector('.lb-caption')
  let cur = 0

  const show = (i) => {
    const list = visible()
    if (!list.length) return
    cur = (i + list.length) % list.length
    const s = list[cur]
    const img = s.querySelector('img')
    media.replaceChildren()
    media.className = 'lb-media' + (s.classList.contains('shot--y') ? ' shot--y' : s.classList.contains('shot--p') ? ' shot--p' : '')
    if (img) {
      const big = img.cloneNode()
      big.removeAttribute('loading')
      media.appendChild(big)
    } else {
      const ph = document.createElement('span')
      ph.setAttribute('aria-hidden', 'true')
      ph.textContent = s.querySelector('.shot-img span').textContent
      media.appendChild(ph)
    }
    caption.textContent = s.querySelector('.shot-caption').textContent
  }

  shots.forEach((s) => {
    s.tabIndex = 0
    s.setAttribute('role', 'button')
    s.setAttribute('aria-label', 'Perbesar foto: ' + s.querySelector('.shot-caption').textContent)
    const open = () => {
      show(visible().indexOf(s))
      dlg.showModal()
    }
    s.addEventListener('click', open)
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        open()
      }
    })
  })

  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close()
    const act = e.target.dataset && e.target.dataset.lb
    if (act === 'prev') show(cur - 1)
    if (act === 'next') show(cur + 1)
    if (act === 'close') dlg.close()
  })
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(cur - 1)
    if (e.key === 'ArrowRight') show(cur + 1)
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  initWaForm()
  initGallery()
  const [navOk, footerOk] = await Promise.all([loadComponent('navbar-placeholder', 'components/navbar.html'), loadComponent('footer-placeholder', 'components/footer.html')])
  if (navOk) {
    initNavbar()
    markActiveLink()
  }
  if (footerOk) {
    const y = document.getElementById('year')
    if (y) y.textContent = new Date().getFullYear()
  }
})
