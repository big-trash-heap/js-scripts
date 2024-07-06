
/**
 * @param {string} str
 * @param {number} gap
 * @param {string} sep
 * @param {boolean} [fromEnd=true]
 */
export function stringSeqsep(str, gap, sep, fromEnd = true) {
    const builded = [];
    const gaps = Math.ceil(str.length / gap);
    const offset = str.length % gap

    if (fromEnd && offset !== 0) {
        builded.push(str.slice(0, offset))

        for (let i = 0; i < gaps - 1; ++i) {
            const s = offset + i * gap;
            builded.push(str.slice(s, s + gap))
        }
    }
    else {
        for (let i = 0; i < gaps; ++i) {
            const s = i * gap;
            builded.push(str.slice(s, s + gap))
        }
    }

    return builded.join(sep);
}
