/**
 * Thin helper around <wa-icon> (Font Awesome icons, bundled with
 * Web Awesome). Keeps icon markup consistent across the kit.
 */
export function icon(name, { size, variant = 'solid', className = '' } = {}) {
  const styleAttr = size ? `style="font-size:${size}"` : '';
  return `<wa-icon name="${name}" variant="${variant}" class="${className}" ${styleAttr}></wa-icon>`;
}
