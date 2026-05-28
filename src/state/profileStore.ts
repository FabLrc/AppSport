import { create } from 'zustand';

import { createProfil, getProfil } from '@/db/repositories/profilRepository';
import type { CreateProfilInput, Profil } from '@/db/repositories/types';

interface ProfileState {
  profile: Profil | null;
  isLoaded: boolean;
  loadProfile: () => Promise<void>;
  createProfile: (input: CreateProfilInput) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  isLoaded: false,

  loadProfile: async () => {
    const profile = await getProfil();
    set({ profile, isLoaded: true });
  },

  createProfile: async (input) => {
    const profile = await createProfil(input);
    set({ profile });
  },
}));
