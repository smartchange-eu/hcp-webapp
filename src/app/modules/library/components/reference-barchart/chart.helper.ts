export function trimLabel(s: any, max: number = 16): string {
  if (typeof s !== 'string') {
    if (typeof s === 'number') {
      return s + '';
    } else {
      return '';
    }
  }

  s = s.trim();
  if (s.length <= max) {
    return s;
  } else {
    return `${s.slice(0, max)}...`;
  }
}

export function reduceTicks(ticks: any[], maxTicks: number): any[] {
  if (ticks.length > maxTicks) {
    const reduced = [];
    const modulus = Math.floor(ticks.length / maxTicks);
    for (let i = 0; i < ticks.length; i++) {
      if (i % modulus === 0) {
        reduced.push(ticks[i]);
      }
    }
    ticks = reduced;
  }

  return ticks;
}

/**
 * Generates a rounded rectanglar path
 *
 * @export
 * @param x, y, w, h, r, tl, tr, bl, br
 */
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  [tl, tr, bl, br]: boolean[]
): string {
  let retval = '';

  w = Math.floor(w);
  h = Math.floor(h);

  w = w === 0 ? 1 : w;
  h = h === 0 ? 1 : h;

  retval = `M${[x + r, y]}`;
  retval += `h${w - 2 * r}`;

  if (tr) {
    retval += `a${[r, r]} 0 0 1 ${[r, r]}`;
  } else {
    retval += `h${r}v${r}`;
  }

  retval += `v${h - 2 * r}`;

  if (br) {
    retval += `a${[r, r]} 0 0 1 ${[-r, r]}`;
  } else {
    retval += `v${r}h${-r}`;
  }

  retval += `h${2 * r - w}`;

  if (bl) {
    retval += `a${[r, r]} 0 0 1 ${[-r, -r]}`;
  } else {
    retval += `h${-r}v${-r}`;
  }

  retval += `v${2 * r - h}`;

  if (tl) {
    retval += `a${[r, r]} 0 0 1 ${[r, -r]}`;
  } else {
    retval += `v${-r}h${r}`;
  }

  retval += `z`;

  return retval;
}
