const PRE_ALPHA_DOWNLOAD = {
  passwordSha256: 'a4ac687554c1d7c28b797a3ad919461adc1fc164bde70fc1627fad2420bb149a',
  filePath: 'downloads/Jupiter-Context-Pre-Alpha-Windows.zip'
};

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

function syncHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 18);
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('open') ?? false;
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

const downloadDialog = document.getElementById('downloadDialog');
const downloadForm = document.getElementById('downloadForm');
const passwordInput = document.getElementById('downloadPassword');
const passwordToggle = document.getElementById('toggleDownloadPassword');
const unlockButton = document.getElementById('unlockDownloadButton');
const errorMessage = document.getElementById('downloadError');
let previousFocus = null;

function openDownloadDialog() {
  if (!downloadDialog || !passwordInput || !errorMessage) return;
  previousFocus = document.activeElement;
  passwordInput.value = '';
  passwordInput.type = 'password';
  if (passwordToggle) passwordToggle.textContent = 'Show';
  errorMessage.textContent = '';
  errorMessage.className = 'download-error';
  downloadDialog.showModal();
  document.body.classList.add('dialog-open');
  window.setTimeout(() => passwordInput.focus(), 40);
}

function closeDownloadDialog() {
  if (!downloadDialog?.open) return;
  downloadDialog.close();
  document.body.classList.remove('dialog-open');
  if (previousFocus instanceof HTMLElement) previousFocus.focus();
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
  if (!passwordInput) return;
  const isVisible = passwordInput.type === 'text';
  passwordInput.type = isVisible ? 'password' : 'text';
  passwordToggle.textContent = isVisible ? 'Show' : 'Hide';
  passwordInput.focus();
});

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
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
  if (!passwordInput || !errorMessage || !unlockButton) return;
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
      passwordInput.select();
      return;
    }
    errorMessage.textContent = 'Access granted. Your download is starting.';
    errorMessage.className = 'download-error success';
    startDownload();
    window.setTimeout(closeDownloadDialog, 850);
  } catch (error) {
    console.error('Unable to verify the private preview password:', error);
    errorMessage.textContent = 'The preview could not be unlocked. Please try again.';
  } finally {
    unlockButton.disabled = false;
    unlockButton.textContent = 'Unlock download';
  }
});
