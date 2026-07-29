/**
 * Dot-matrix land mask for `WorldMap`.
 *
 * Generated offline from Wikimedia Commons' public-domain equirectangular
 * world image ("Equirectangular projection SW.jpg", NASA-derived) by sampling
 * a 220 x 82 grid and keeping the cells that read as land.
 *
 * Encoding — one line per grid row, rows separated by "|", each row a list of
 * horizontal runs written as four base-36 digits: two for the run's starting
 * column, two for its length. Land is strongly contiguous along a row, so
 * 5,707 cells compress to 506 runs and the whole world costs about 2.1 kB of
 * source. That is what makes this density affordable, and the density is what
 * keeps the map legible when the trade-corridor view crops it to a third of
 * its width — a coarser grid stops reading as continents at that zoom.
 *
 * Grid geometry — the projection is plain equirectangular, so a city's dot
 * position is a linear function of its longitude and latitude. `lib/worldMap`
 * derives both from the constants exported here; nothing is hand-placed.
 *
 *   columns 220  ·  rows 82  ·  longitude -180…180  ·  latitude 78°N…56°S
 *
 * Antarctica is outside the latitude window on purpose: it carries no trade
 * meaning here and its mass unbalances the composition.
 */

/** Run-length rows; see the note above. Decoded once, below. */
const ENCODED =
  "00011l071v0u3b024r01|000111021d011i011k041p011x0t4q054w02|" +
  "000115021g011i031m03240m40034i0h5e035i015k03|" +
  "00010y051d021g021k021n02240i2n023z0148054f0o54055f06|" +
  "00010z0112091g011j0a260g2n013y0247125a0e6301|" +
  "00010b0d0r0614081f031m021r052501270g3d08471n5w015y03|" +
  "0002090w160118031e021h031m021s05260c3b0f3t013v29|00060b0p110m1u06260b3a0d3o033s2c|" +
  "00010401091c1m011r0726072o0639063h063o013q2e|0001091a1m011v04270637073f2p|" +
  "000109181r03280435083f083o215r09|00010a0a0o0s1r05352j5s03|" +
  "00010e020r0r1r092z01360139043f215q03|00010d020t0r1r0a2y0337023a023f1z5p04|" +
  "00010t0v1q0c2x012z0237033e1z5p03|00010t010v0u1q0e2w023003351q4w0l5p02|" +
  "00010w182w012z04342d5p01|00010x111z012301322d5g02|00010y0m1m0d2204302f5g01|" +
  "00010z0k1k011m0d312d5g01|00010z0m1m011p0c310j3m1r5g01|" +
  "00010y0n1m092x033103350138023c073q053x1f5g02|00010z0w2x0739023e053m013r053y1b|" +
  "00010z0u2x0537013b013e023i0e3y1a5f01|00010z0u2w063f013i0e3z1556025f01|" +
  "0001100s2y0334043j1l56035d03|0001110r2y0b3o1f57015a05|0001120o2x0c3o1g5903|" +
  "0001130m2w0f3e033n1i5901|0001150g1m032w29|0001160a1o012v113x17|" +
  "0001150117081o012u0t3o093z014112|0001160118072t0u3p083z01430z|000119062s0w3p0d470u5301|" +
  "00011a051p022s0w3q0c480r|00011a051j021r012s0x3q0b4a094m094w01|" +
  "00011b051i031u022s0x3r0a4a074n074w01|00011d072s0y3s074b054o075301|" +
  "00011i052s0y3s054b044p075301|00011j042s134b044q06|00011l022s104c034q014s04|" +
  "00011m011s061z022t144c034t025401|00011n0f2u134d014q015601|00011r0c2v114f014q025502|" +
  "00011r0f2w06350r4r025002|00011r0g380n4p014r024z03|00011q0i380m4q034x05|" +
  "00011p0k380k4q034w065501|00011p0m370e3m054r034x0453015a01|" +
  "00011p0p380j4s034x04520258015a07|00011p0q390h4t0254015c06|00011p0s390h4u025e06|" +
  "00011q0r3a0g4x035e06|00011r0p3a0g55015j02|00011r0p3a0h|00011r0o3a0h59045g01|" +
  "00011s0m3a0h3v0256075g02|00011u0k390h3t0355095g026301|00011v0j390g3t03540f|" +
  "00011v0j3a0e3t03530h|00011v0i3a0d3t03500l|00011v0i3b0d3s034z0n|00011v0f3b0c3t024z0n|" +
  "00011v0e3b0b4z0o|00011v0e3c0a4z0o|00011v0d3c09500n|00011v0c3d07500n|" +
  "00011v0b3d0650065c0a|00011u0b3e0150035e08|00011u0a5f06|00011t0a5f066001|00011t086002|" +
  "00011t075j016001|00011t065i025y01|00011t055w02|00011t045w02|00011t05|00011s05|00011t03|" +
  "00011t04|00011u04|0001";

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const fromBase36 = (pair) => DIGITS.indexOf(pair[0]) * 36 + DIGITS.indexOf(pair[1]);

/**
 * @type {ReadonlyArray<[number, number]>} land cells as [column, row].
 */
export const LAND_CELLS = ENCODED.split("|").flatMap((row, rowIndex) => {
  const cells = [];
  for (let i = 0; i + 3 < row.length; i += 4) {
    const start = fromBase36(row.slice(i, i + 2));
    const length = fromBase36(row.slice(i + 2, i + 4));
    for (let n = 0; n < length; n += 1) cells.push([start + n, rowIndex]);
  }
  return cells;
});

export const GRID_COLS = 220;
export const GRID_ROWS = 82;
