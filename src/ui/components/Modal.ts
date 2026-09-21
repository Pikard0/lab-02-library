interface ModalOptions {
  title: string;
  message: string;
}

export function showModal(options: ModalOptions): void {
  const existingModal = document.querySelector('.component-modal');
  existingModal?.remove();

  const wrapper = document.createElement('div');
  wrapper.className = 'component-modal alert alert-info';

  const title = document.createElement('strong');
  title.textContent = options.title;

  const message = document.createElement('p');
  message.className = 'mb-0';
  message.textContent = options.message;

  wrapper.append(title, message);
  document.body.append(wrapper);
}
