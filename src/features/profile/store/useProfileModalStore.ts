import { create } from "zustand";

interface ProfileModalState {
  isOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  setProfileModalOpen: (open: boolean) => void;
}

export const useProfileModalStore = create<ProfileModalState>((set) => ({
  isOpen: false,
  openProfileModal: () => set({ isOpen: true }),
  closeProfileModal: () => set({ isOpen: false }),
  setProfileModalOpen: (open) => set({ isOpen: open }),
}));
