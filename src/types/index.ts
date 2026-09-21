export interface ModalState {
  title: string;
  message: string;
  actionLabel?: string;
  onConfirm?: () => void;
}

export interface AppState {
  bookPage: number;
  userPage: number;
  searchTerm: string;
  modal: ModalState | null;
}
