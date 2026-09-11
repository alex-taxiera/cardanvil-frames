import { type CardBoxes } from "@cardanvil/frame-kit";

/**
 * Where everything sits on the card.
 *
 * Absolute pixels on a 3264 x 4440 canvas — the full printed sheet *including
 * bleed*, 2.72 x 3.7 in at 1200 DPI. The card face inside it is 63 x 88 mm,
 * leaving roughly 3 mm of bleed on every edge, so `y: 0` is above the top of
 * the card rather than at it.
 *
 * `fontSize` is in points, not pixels; the renderer converts.
 */
export const boxes: CardBoxes = {
  /** The window your art shows through. The placeholder frames are transparent here. */
  art: { x: 376, y: 610, width: 2512, height: 1839 },

  mana: { x: 370, y: 373, width: 2536, height: 177, fontSize: 55 },
  title: { x: 390, y: 385, width: 2540, height: 172, fontSize: 120 },
  type: { x: 390, y: 2532, width: 2500, height: 144, fontSize: 106 },

  setSymbol: { x: 2590, y: 2505, width: 300, height: 175 },

  rules: { x: 390, y: 2766, width: 2471, height: 1180, fontSize: 116 },

  /** Only drawn on cards that have power and toughness. */
  pt: { x: 2466, y: 3846, width: 490, height: 230, fontSize: 116 },

  /** The artist line and set information along the bottom. */
  collectorInfo: {
    x: 333,
    y: 4019,
    width: 2200,
    height: 200,
    fontSize: 53,
    color: "white",
  },
};
