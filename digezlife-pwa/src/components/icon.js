/**
 * Thin helper around <wa-icon> (Font Awesome icons, bundled with
 * Web Awesome). Keeps icon markup consistent across the kit.
 */
export function icon(name, { size, variant = 'solid', className = '' } = {}) {
  // Built-in inline SVG for arrow-up-right from svgrepo #437727
  if (name === 'arrow-up-right') {
    const sizeStyle = size ? `width:${size}; height:${size}; font-size:${size};` : 'width:1em; height:1em;';
    return `<svg class="wa-icon-svg ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:-0.125em; ${sizeStyle}"><path d="M16.3891 8.11096L8.61091 15.8891"/><path d="M16.3891 8.11096L16.7426 12"/><path d="M16.3891 8.11096L12.5 7.75741"/></svg>`;
  }

  const styleAttr = size ? `style="font-size:${size}"` : '';
  return `<wa-icon name="${name}" variant="${variant}" class="${className}" ${styleAttr}></wa-icon>`;
}
