type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

export function createButton(
  text: string,
  variant: ButtonVariant = 'primary',
  type: 'button' | 'submit' = 'button',
  onClick?: () => void
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = type;
  button.className = `btn btn-${variant}`;
  button.textContent = text;

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}
