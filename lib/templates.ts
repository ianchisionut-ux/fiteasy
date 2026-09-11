// Exemple predefinite — pornesc rapid un plan pentru un client nou.
// Instructorul poate oricând să-și salveze propriile planuri ca exemple
// personale (vezi model Template din schema).

export type WorkoutDay = { label: string; entries: { title: string; details: string; muscleGroup?: string }[] }
export type WorkoutProgram = { id: string; name: string; description: string; days: WorkoutDay[] }

export const WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'ppl-3',
    name: 'Push / Pull / Legs (3 zile)',
    description: 'Clasic pentru hipertrofie — împins, tras, picioare, fiecare o dată pe săptămână.',
    days: [
      { label: 'Push (Piept/Umeri/Triceps)', entries: [
        { title: 'Împins culcat cu bara', details: '4 serii x 8 repetări', muscleGroup: 'Piept' },
        { title: 'Împins din umeri', details: '3 serii x 10 repetări', muscleGroup: 'Umeri' },
        { title: 'Împins la helcometru', details: '3 serii x 12 repetări', muscleGroup: 'Triceps' },
      ]},
      { label: 'Pull (Spate/Biceps)', entries: [
        { title: 'Tracțiuni la bară', details: '4 serii x 6-8 repetări', muscleGroup: 'Spate' },
        { title: 'Ramat cu bara', details: '3 serii x 10 repetări', muscleGroup: 'Spate' },
        { title: 'Flexii cu bara', details: '3 serii x 10 repetări', muscleGroup: 'Biceps' },
      ]},
      { label: 'Legs (Picioare)', entries: [
        { title: 'Genuflexiuni', details: '4 serii x 8 repetări', muscleGroup: 'Picioare' },
        { title: 'Presă pentru picioare', details: '3 serii x 12 repetări', muscleGroup: 'Picioare' },
        { title: 'Flexii pentru femurali', details: '3 serii x 12 repetări', muscleGroup: 'Picioare' },
      ]},
    ],
  },
  {
    id: 'upper-lower-4',
    name: 'Upper / Lower (4 zile)',
    description: 'Fiecare grupă lucrată de 2 ori pe săptămână — bun echilibru volum/recuperare.',
    days: [
      { label: 'Upper A', entries: [
        { title: 'Împins culcat cu bara', details: '4 serii x 6 repetări', muscleGroup: 'Piept' },
        { title: 'Ramat cu bara', details: '4 serii x 8 repetări', muscleGroup: 'Spate' },
        { title: 'Ridicări laterale', details: '3 serii x 12 repetări', muscleGroup: 'Umeri' },
      ]},
      { label: 'Lower A', entries: [
        { title: 'Genuflexiuni', details: '4 serii x 6 repetări', muscleGroup: 'Picioare' },
        { title: 'Fandări', details: '3 serii x 10 repetări/picior', muscleGroup: 'Picioare' },
      ]},
      { label: 'Upper B', entries: [
        { title: 'Împins din umeri', details: '4 serii x 8 repetări', muscleGroup: 'Umeri' },
        { title: 'Tracțiuni la bară', details: '4 serii x 8 repetări', muscleGroup: 'Spate' },
        { title: 'Dips', details: '3 serii x 10 repetări', muscleGroup: 'Triceps' },
      ]},
      { label: 'Lower B', entries: [
        { title: 'Presă pentru picioare', details: '4 serii x 10 repetări', muscleGroup: 'Picioare' },
        { title: 'Flexii pentru femurali', details: '3 serii x 12 repetări', muscleGroup: 'Picioare' },
        { title: 'Ridicări pe vârfuri', details: '3 serii x 15 repetări', muscleGroup: 'Picioare' },
      ]},
    ],
  },
  {
    id: 'full-body-3',
    name: 'Full Body (3 zile)',
    description: 'Corp întreg de 3 ori pe săptămână — ideal pentru începători sau timp limitat.',
    days: [
      { label: 'Full Body A', entries: [
        { title: 'Genuflexiuni', details: '3 serii x 10 repetări', muscleGroup: 'Picioare' },
        { title: 'Împins culcat cu gantere', details: '3 serii x 10 repetări', muscleGroup: 'Piept' },
        { title: 'Ramat cu gantera', details: '3 serii x 10 repetări/braț', muscleGroup: 'Spate' },
      ]},
      { label: 'Full Body B', entries: [
        { title: 'Presă pentru picioare', details: '3 serii x 12 repetări', muscleGroup: 'Picioare' },
        { title: 'Tracțiuni la bară', details: '3 serii x 6 repetări', muscleGroup: 'Spate' },
        { title: 'Împins din umeri', details: '3 serii x 10 repetări', muscleGroup: 'Umeri' },
      ]},
      { label: 'Full Body C', entries: [
        { title: 'Fandări', details: '3 serii x 10 repetări/picior', muscleGroup: 'Picioare' },
        { title: 'Împins la aparat', details: '3 serii x 12 repetări', muscleGroup: 'Piept' },
        { title: 'Flexii cu gantere', details: '3 serii x 12 repetări', muscleGroup: 'Biceps' },
      ]},
    ],
  },
]

export type NutritionMeal = { time: string; title: string; details: string; protein: number; carbs: number; fat: number; calories: number }
export type NutritionDay = { id: string; name: string; description: string; targets: { protein: number; carbs: number; fat: number; calories: number }; meals: NutritionMeal[] }

export const NUTRITION_DAYS: NutritionDay[] = [
  {
    id: 'standard-2000',
    name: 'Zi standard · ~2000 kcal',
    description: 'Menținere, echilibru normal de macro-uri.',
    targets: { protein: 130, carbs: 220, fat: 65, calories: 2000 },
    meals: [
      { time: '08:00', title: 'Mic dejun', details: 'Ovăz cu fructe și iaurt grecesc', protein: 25, carbs: 55, fat: 12, calories: 420 },
      { time: '13:00', title: 'Prânz', details: 'Piept de pui, orez, legume la abur', protein: 45, carbs: 70, fat: 15, calories: 620 },
      { time: '17:00', title: 'Gustare', details: 'Shake proteic + banană', protein: 25, carbs: 30, fat: 5, calories: 280 },
      { time: '20:00', title: 'Cină', details: 'Somon, cartof dulce, salată', protein: 35, carbs: 65, fat: 33, calories: 680 },
    ],
  },
  {
    id: 'cutting-1600',
    name: 'Zi definire · ~1600 kcal',
    description: 'Deficit caloric moderat, proteină ridicată pentru păstrarea masei musculare.',
    targets: { protein: 140, carbs: 130, fat: 50, calories: 1600 },
    meals: [
      { time: '08:00', title: 'Mic dejun', details: 'Omletă din 3 ouă + spanac', protein: 24, carbs: 5, fat: 18, calories: 280 },
      { time: '13:00', title: 'Prânz', details: 'Piept de pui, quinoa, broccoli', protein: 45, carbs: 45, fat: 10, calories: 460 },
      { time: '17:00', title: 'Gustare', details: 'Iaurt grecesc + migdale', protein: 20, carbs: 10, fat: 12, calories: 240 },
      { time: '20:00', title: 'Cină', details: 'Pește alb, legume la grătar', protein: 40, carbs: 30, fat: 8, calories: 350 },
    ],
  },
  {
    id: 'bulking-2800',
    name: 'Zi masă musculară · ~2800 kcal',
    description: 'Surplus caloric pentru creștere în masă, carbohidrați mai mulți.',
    targets: { protein: 160, carbs: 350, fat: 80, calories: 2800 },
    meals: [
      { time: '08:00', title: 'Mic dejun', details: 'Ovăz, unt de arahide, banană, lapte', protein: 30, carbs: 90, fat: 20, calories: 650 },
      { time: '13:00', title: 'Prânz', details: 'Carne de vită, orez, avocado', protein: 50, carbs: 100, fat: 25, calories: 800 },
      { time: '17:00', title: 'Gustare', details: 'Shake proteic, ovăz, unt de arahide', protein: 35, carbs: 60, fat: 15, calories: 500 },
      { time: '20:00', title: 'Cină', details: 'Somon, paste, legume', protein: 45, carbs: 100, fat: 20, calories: 850 },
    ],
  },
]
