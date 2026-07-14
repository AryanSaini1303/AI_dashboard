// Static frontend lookup mapping known minerals to their crystal system —
// used for on-brand scientific detail (badge + crystal hero). No backend
// change required; unknown minerals fall back to 'amorphous'.
const SYSTEMS = {
  calcite: { system: 'Trigonal', hint: 'rhombohedral cleavage' },
  granite: { system: 'Composite', hint: 'igneous, interlocking grains' },
  limestone: { system: 'Sedimentary', hint: 'calcite-rich, bioclastic' },
  quartz: { system: 'Trigonal', hint: 'hexagonal prisms' },
  pyrite: { system: 'Cubic', hint: 'striated cube faces' },
  amethyst: { system: 'Trigonal', hint: 'violet quartz variety' },
  malachite: { system: 'Monoclinic', hint: 'botryoidal habit' }
}

export function crystalSystem(name) {
  if (!name) return { system: 'Unknown', hint: '' }
  return SYSTEMS[name.toLowerCase()] || { system: 'Amorphous', hint: '' }
}
