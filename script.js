const PRE_ALPHA_DOWNLOAD = {
  // Temporary password: JupiterAlpha2026!
  // Replace the hash before launch if you choose a different password.
  passwordSha256: 'a4ac687554c1d7c28b797a3ad919461adc1fc164bde70fc1627fad2420bb149a',
  filePath: 'downloads/Jupiter-Context-Pre-Alpha-Windows.zip'
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(event) {
    const targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const downloadButton = document.getElementById('preAlphaDownloadButton');
const downloadDialog = document.getElementById('downloadDialog');
const downloadForm = document.getElementById('downloadForm');
const passwordInput = document.getElementById('downloadPassword');
const passwordToggle = document.getElementById('toggleDownloadPassword');
const closeDialogButton = document.getElementById('closeDownloadDialog');
const cancelDialogButton = document.getElementById('cancelDownloadDialog');
const unlockButton = document.getElementById('unlockDownloadButton');
const errorMessage = document.getElementById('downloadError');

function openDownloadDialog() {
  if (!downloadDialog) return;

  passwordInput.value = '';
  errorMessage.textContent = '';
  errorMessage.className = 'download-error';
  downloadDialog.showModal();
  document.body.classList.add('dialog-open');
  window.setTimeout(() => passwordInput.focus(), 50);
}

function closeDownloadDialog() {
  if (!downloadDialog?.open) return;
  downloadDialog.close();
  document.body.classList.remove('dialog-open');
  downloadButton?.focus();
}

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

downloadButton?.addEventListener('click', openDownloadDialog);
closeDialogButton?.addEventListener('click', closeDownloadDialog);
cancelDialogButton?.addEventListener('click', closeDownloadDialog);

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

    errorMessage.textContent = 'Access granted. Your download is starting.';
    errorMessage.className = 'download-error success';
    startDownload();
    window.setTimeout(closeDownloadDialog, 900);
  } catch (error) {
    console.error('Unable to verify the pre-alpha password:', error);
    errorMessage.textContent = 'The download could not be unlocked. Please try again.';
  } finally {
    unlockButton.disabled = false;
    unlockButton.textContent = 'Unlock download';
  }
});
