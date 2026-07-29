const PRE_ALPHA_DOWNLOAD = {
  passwordSha256: 'a4ac687554c1d7c28b797a3ad919461adc1fc164bde70fc1627fad2420bb149a',
  filePath: 'downloads/Jupiter-Context-Pre-Alpha-Windows.zip'
};

const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const navToggle = document.querySelector('[data-nav-toggle]');

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 18);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(Boolean(open)));
  navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    nav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

const downloadDialog = document.getElementById('downloadDialog');
const downloadForm = document.getElementById('downloadForm');
const passwordInput = document.getElementById('downloadPassword');
const passwordToggle = document.getElementById('toggleDownloadPassword');
const unlockButton = document.getElementById('unlockDownloadButton');
const errorMessage = document.getElementById('downloadError');

function openDownloadDialog() {
  if (!downloadDialog) return;
  passwordInput.value = '';
  errorMessage.textContent = '';
  errorMessage.className = 'download-error';
  downloadDialog.showModal();
  document.body.classList.add('dialog-open');
  window.setTimeout(() => passwordInput.focus(), 60);
}

function closeDownloadDialog() {
  if (!downloadDialog?.open) return;
  downloadDialog.close();
  document.body.classList.remove('dialog-open');
}

document.querySelectorAll('[data-open-download]').forEach(button => button.addEventListener('click', openDownloadDialog));
document.querySelectorAll('[data-close-download]').forEach(button => button.addEventListener('click', closeDownloadDialog));

downloadDialog?.addEventListener('click', event => {
  if (event.target === downloadDialog) closeDownloadDialog();
});

downloadDialog?.addEventListener('cancel', event => {
  event.preventDefault();
  closeDownloadDialog();
});

passwordToggle?.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  passwordToggle.textContent = showing ? 'Show' : 'Hide';
  passwordInput.focus();
});

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function startDownload() {
  const link = document.createElement('a');
  link.href = PRE_ALPHA_DOWNLOAD.filePath;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

downloadForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) {
    errorMessage.textContent = 'Enter the access password.';
    passwordInput.focus();
    return;
  }

  unlockButton.disabled = true;
  unlockButton.textContent = 'Verifying…';
  errorMessage.textContent = '';
  errorMessage.className = 'download-error';

  try {
    const passwordHash = await sha256(password);
    if (passwordHash !== PRE_ALPHA_DOWNLOAD.passwordSha256) {
      errorMessage.textContent = 'That password is not correct.';
      errorMessage.className = 'download-error shake';
      passwordInput.select();
      window.setTimeout(() => errorMessage.classList.remove('shake'), 350);
      return;
    }

    errorMessage.textContent = 'Access verified. Starting download…';
    errorMessage.className = 'download-error success';
    window.setTimeout(() => {
      startDownload();
      closeDownloadDialog();
    }, 450);
  } catch (error) {
    console.error(error);
    errorMessage.textContent = 'The browser could not verify the password. Try a current version of Edge, Chrome, or Firefox.';
  } finally {
    unlockButton.disabled = false;
    unlockButton.textContent = 'Unlock download';
  }
});
