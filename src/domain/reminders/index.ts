import type { JournalRappel, MacroPlanning, ActivitePlanning } from '@/db/repositories/types';

export interface NotificationSpec {
  identifier: string;
  title: string;
  body: string;
  trigger:
    | { type: 'daily'; hour: number; minute: number }
    | { type: 'weekly'; weekday: number; hour: number; minute: number };
}

// expo-notifications: weekday 1 = dimanche, 2 = lundi, ..., 7 = samedi
const JOUR_TO_WEEKDAY: Record<string, number> = {
  dimanche: 1,
  lundi: 2,
  mardi: 3,
  mercredi: 4,
  jeudi: 5,
  vendredi: 6,
  samedi: 7,
};

function parseHoraire(horaire: string): { hour: number; minute: number } {
  const [h, m] = horaire.split(':').map(Number);
  return { hour: h ?? 0, minute: m ?? 0 };
}

const TITLES: Record<string, string> = {
  seance_musculation: 'Séance de musculation',
  course: 'Course à pied',
  hydratation: 'Hydratation',
  petit_dejeuner: 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  collation: 'Collation',
  diner: 'Dîner',
  pause_posture: 'Pause posture',
  mensurations: 'Mensurations',
};

const BODIES: Record<string, string> = {
  seance_musculation: "C'est l'heure de ta séance ! 💪",
  course: 'Prêt pour ta sortie ? 🏃',
  hydratation: "Pense à boire un verre d'eau 💧",
  petit_dejeuner: 'Un bon petit-déjeuner pour bien démarrer 🥐',
  dejeuner: 'Pause déjeuner — mange équilibré 🥗',
  collation: "Une petite collation pour tenir jusqu'au soir 🍎",
  diner: "C'est l'heure de dîner 🍽️",
  pause_posture: 'Redresse le dos et étire-toi 🧘',
  mensurations: 'Pense à prendre tes mensurations cette semaine 📏',
};

function muscuDaysFor(planning: MacroPlanning, activite: ActivitePlanning): string[] {
  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
  return jours.filter((j) => planning[j] === activite);
}

export function buildNotificationSpecs(
  rappel: JournalRappel,
  planning: MacroPlanning | null,
): NotificationSpec[] {
  if (!rappel.actif) return [];

  const { type, horaire } = rappel;
  const { hour, minute } = parseHoraire(horaire);
  const title = TITLES[type] ?? type;
  const body = BODIES[type] ?? '';

  switch (type) {
    case 'seance_musculation': {
      if (!planning) return [];
      const days = muscuDaysFor(planning, 'musculation_haut').concat(
        muscuDaysFor(planning, 'musculation_bas'),
      );
      return days.map((jour) => ({
        identifier: `rappel_${type}_${jour}`,
        title,
        body,
        trigger: { type: 'weekly' as const, weekday: JOUR_TO_WEEKDAY[jour]!, hour, minute },
      }));
    }

    case 'course': {
      if (!planning) return [];
      const days = muscuDaysFor(planning, 'course');
      return days.map((jour) => ({
        identifier: `rappel_${type}_${jour}`,
        title,
        body,
        trigger: { type: 'weekly' as const, weekday: JOUR_TO_WEEKDAY[jour]!, hour, minute },
      }));
    }

    case 'hydratation': {
      // Toutes les 2h de start à 19h
      const specs: NotificationSpec[] = [];
      for (let h = hour; h <= 19; h += 2) {
        specs.push({
          identifier: `rappel_hydratation_${h}`,
          title,
          body,
          trigger: { type: 'daily' as const, hour: h, minute },
        });
      }
      return specs;
    }

    case 'pause_posture': {
      // Toutes les heures de start à 18h
      const specs: NotificationSpec[] = [];
      for (let h = hour; h <= 18; h += 1) {
        specs.push({
          identifier: `rappel_posture_${h}`,
          title,
          body,
          trigger: { type: 'daily' as const, hour: h, minute },
        });
      }
      return specs;
    }

    case 'mensurations':
      // Hebdomadaire samedi
      return [
        {
          identifier: 'rappel_mensurations',
          title,
          body,
          trigger: { type: 'weekly' as const, weekday: 7, hour, minute },
        },
      ];

    default:
      // petit_dejeuner, dejeuner, collation, diner — quotidien
      return [
        {
          identifier: `rappel_${type}`,
          title,
          body,
          trigger: { type: 'daily' as const, hour, minute },
        },
      ];
  }
}
