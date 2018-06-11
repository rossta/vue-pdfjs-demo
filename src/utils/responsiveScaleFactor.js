export default function getScaleFactor() {
  const [LARGE, MIDDLE, SMALL] = [480, 768, 1024];
  const SCALE_FACTORS = {
    [SMALL]: 0.95,
    [MIDDLE]: 0.85,
    [LARGE]: 0.75
  };
  const clientWidth = document.body.clientWidth;
  if (clientWidth > LARGE) {
    return SCALE_FACTORS[LARGE];
  } else if (clientWidth > MIDDLE) {
    return SCALE_FACTORS[MIDDLE];
  } else {
    return SCALE_FACTORS[SMALL];
  }
}
