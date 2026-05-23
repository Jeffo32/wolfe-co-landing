// Background media presets — each one is a named bundle that maps section
// ids to a video or image asset.
//
// Files must live in /public/ so they're served at stable URLs.
// Section ids: hero, statement, divisions, capabilities, offers,
//              availability, proof, cta.
//
// To add a new preset, copy one of the blocks below and update the paths.
// The active preset is selected in the dev-tools Editor (long-press the BG
// button or press D, then pick a preset at the top of the editor).

export const PRESETS = [
  {
    id: 'default',
    name: 'Default',
    sections: {
      // Empty — sections fall back to whatever VITE_BG_<ID> env vars set
      // (or solid colour bg if none).
    },
  },

  // ----- Example presets — uncomment / edit once you have files in /public/ -----
  //
  // {
  //   id: 'restaurant',
  //   name: 'Restaurant',
  //   sections: {
  //     hero:         { type: 'video', url: '/restaurant/hero.mp4' },
  //     statement:    { type: 'image', url: '/restaurant/statement.jpg' },
  //     capabilities: { type: 'video', url: '/restaurant/dish.mp4' },
  //     proof:        { type: 'image', url: '/restaurant/cooks.jpg' },
  //   },
  // },
  //
  // {
  //   id: 'fitness',
  //   name: 'Fitness',
  //   sections: {
  //     hero:         { type: 'video', url: '/fitness/hero.mp4' },
  //     capabilities: { type: 'video', url: '/fitness/training.mp4' },
  //   },
  // },
];
