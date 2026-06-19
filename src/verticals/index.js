import blog from './blog.js';
import models from './models.js';
import listings from './listings.js';

export const VERTICALS = [blog, models, listings];
export const byKey = Object.fromEntries(VERTICALS.map((v) => [v.key, v]));
