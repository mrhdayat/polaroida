export const FILTER_STYLES: Record<string, string> = {
  normal: "brightness(100%) contrast(100%) saturate(100%) sepia(0%)",
  kodak: "contrast(110%) saturate(120%) brightness(105%) sepia(20%) hue-rotate(-5deg)",
  fujifilm: "saturate(110%) contrast(105%) brightness(105%) hue-rotate(5deg) sepia(10%)",
  polaroid600: "contrast(120%) saturate(90%) brightness(110%) sepia(15%)",
  bw: "grayscale(100%) contrast(110%) brightness(100%)",
  sepia: "sepia(70%) contrast(90%) brightness(95%)",
  pastel: "brightness(115%) contrast(85%) saturate(80%) sepia(10%)",
};

export const FILTER_NAMES = [
  { id: 'normal', label: 'Normal' },
  { id: 'kodak', label: 'Kodak Gold' },
  { id: 'fujifilm', label: 'Fujifilm' },
  { id: 'polaroid600', label: 'Polaroid 600' },
  { id: 'bw', label: 'B&W' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'pastel', label: 'Pastel' },
];

export const getFilterStyle = (config: any) => {
  const base = FILTER_STYLES[config.filter || 'normal'] || FILTER_STYLES['normal'];
  // Append manual adjustments
  return `${base} brightness(${100 + (config.brightness || 0)}%) contrast(${100 + (config.contrast || 0)}%) saturate(${100 + (config.warmth || 0)}%)`;
};
