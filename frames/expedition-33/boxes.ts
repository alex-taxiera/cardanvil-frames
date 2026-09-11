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
  art: {
    x: 0,
    y: 0,
    width: 3264,
    height: 4440,
  },

  mana: { x: 370, y: 350, width: 2600, height: 177, fontSize: 55 },
  title: {
    x: 370,
    y: 315,
    width: 2600,
    height: 250,
    fontSize: 120,
    color: "white",
  },
  type: {
    x: 385,
    y: 2450,
    width: 2365,
    height: 230,
    fontSize: 106,
    color: "white",
  },

  setSymbol: {
    x: 2450,
    y: 2440,
    width: 300,
    height: 250,
  },

  rules: {
    x: 389,
    y: 2720,
    width: 2520,
    height: 1050,
    fontSize: 116,
    color: "white",
  },

  /** Only drawn on cards that have power and toughness. */
  pt: {
    x: 2537,
    y: 3820,
    width: 320,
    height: 200,
    fontSize: 116,
    color: "white",
  },

  ptImage: {
    x: 2426,
    y: 3637,
  },

  nicknameTitle: {
    x: 380,
    y: 610,
    width: 2106,
    height: 140,
    fontSize: 70,
    color: "white",
    outlineColor: "black",
    outlineWidth: 30,
    textAlign: "left",
  },

  /** The artist line and set information along the bottom. */
  collectorInfo: {
    x: 333,
    y: 4050,
    width: 2200,
    height: 200,
    fontSize: 53,
    color: "white",
    outlineColor: "black",
    outlineWidth: 30,
  },
};
