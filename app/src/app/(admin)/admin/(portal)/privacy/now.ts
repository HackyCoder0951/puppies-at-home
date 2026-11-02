/** Server clock (kept out of components: render must stay pure). */
export const currentTime = (): Date => new Date();
