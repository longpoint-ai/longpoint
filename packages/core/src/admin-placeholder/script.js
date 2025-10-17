const commands = {
  npm: 'npm install @longpoint/admin',
  yarn: 'yarn add @longpoint/admin',
  pnpm: 'pnpm add @longpoint/admin',
  bun: 'bun add @longpoint/admin',
};

let currentPM = 'npm';

function updateCommand(pm) {
  currentPM = pm;
  const commandText = document.getElementById('command-text');
  commandText.textContent = commands[pm];

  // Update active button
  document.querySelectorAll('.pm-button').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-pm="${pm}"]`).classList.add('active');
}

function copyCommand() {
  const command = commands[currentPM];
  const button = document.querySelector('.copy-button');

  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        showCopiedFeedback(button);
      })
      .catch(() => {
        fallbackCopy(command, button);
      });
  } else {
    fallbackCopy(command, button);
  }
}

function fallbackCopy(command, button) {
  // Fallback for older browsers or non-secure contexts
  const textArea = document.createElement('textarea');
  textArea.value = command;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showCopiedFeedback(button);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }

  document.body.removeChild(textArea);
}

function showCopiedFeedback(button) {
  button.textContent = 'Copied!';
  button.classList.add('copied');

  setTimeout(() => {
    button.textContent = 'Copy';
    button.classList.remove('copied');
  }, 2000);
}

// Add event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  // Package manager buttons
  document.querySelectorAll('.pm-button').forEach((button) => {
    button.addEventListener('click', function () {
      const pm = this.getAttribute('data-pm');
      updateCommand(pm);
    });
  });

  // Copy button
  document.querySelector('.copy-button').addEventListener('click', function () {
    copyCommand();
  });
});
