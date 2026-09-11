// A barrel like this *is* an asset set: each export is a frame colour, and the
// whole module gets wired into `frameAssets.base` in one go.
//
// Export only keys the field accepts. Passing a barrel with extra exports
// type-checks — excess property checks do not apply to namespace objects — and
// the extra keys then end up in your frame where nothing can use them.
export { default as w } from "./w.png";
export { default as u } from "./u.png";
export { default as b } from "./b.png";
export { default as r } from "./r.png";
export { default as g } from "./g.png";
export { default as m } from "./m.png";
export { default as a } from "./a.png";
export { default as c } from "./c.png";
export { default as l } from "./l.png";
export { default as v } from "./v.png";
