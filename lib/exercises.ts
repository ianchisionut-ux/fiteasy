export const MUSCLE_GROUPS = [
  'Piept',
  'Spate',
  'Umeri',
  'Biceps',
  'Triceps',
  'Picioare',
  'Abdomen',
  'Cardio',
] as const

export type MuscleGroup = typeof MUSCLE_GROUPS[number]

// Listă scurtă, curată, de exerciții comune per grupă — pentru alegere rapidă
// la construirea unui antrenament, fără să fie nevoie să se scrie totul de mână.
export const EXERCISES: Record<MuscleGroup, string[]> = {
  Piept: ['Împins culcat cu bara', 'Împins culcat cu gantere', 'Flotări', 'Fluturări cu gantere', 'Împins la aparat'],
  Spate: ['Tracțiuni la bară', 'Ramat cu bara', 'Tragere la helcometru', 'Ramat cu gantera', 'Hiperextensii'],
  Umeri: ['Împins din umeri', 'Ridicări laterale', 'Ridicări frontale', 'Fluturări aplecat', 'Presă Arnold'],
  Biceps: ['Flexii cu bara', 'Flexii cu gantere', 'Flexii tip ciocan', 'Flexii la helcometru'],
  Triceps: ['Împins la helcometru', 'Extensii deasupra capului', 'Dips', 'Împins culcat priză îngustă'],
  Picioare: ['Genuflexiuni', 'Presă pentru picioare', 'Fandări', 'Extensii pentru cvadriceps', 'Flexii pentru femurali', 'Ridicări pe vârfuri'],
  Abdomen: ['Crunch-uri', 'Plank', 'Ridicări de picioare', 'Răsuciri rusești'],
  Cardio: ['Alergare', 'Bicicletă', 'Săritura cu coarda', 'Vâslit', 'HIIT'],
}
