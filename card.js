/* The Garden's lantern card (G1–G11), ported from the painted Garden for the 2D map, 14 Nov 2026.
   Its blocks are copied unchanged: course routes, the NSW syllabus layer (approved by Justin, 12 Nov 2026), the strand,
   the deceased notice and the glossary helpers. Composer threads (F2), style lights (F3) and events (F4) arrive in later stages. */
(() => {
const GX = window.GX, DATA = GX.DATA, MIN = GX.MIN, ATLAS = GX.ATLAS, PEOPLE = GX.PEOPLE || {};
const h = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
const N = {}; DATA.nodes.forEach(n => N[n.id] = n);
const E = {}; DATA.events.forEach(e => E[e.id] = e);
const kin = {}; DATA.nodes.forEach(n => kin[n.id] = {pf: [], pt: [], if: [], it: [], rf: [], rt: [], ev: []});
DATA.links.forEach(([a, b, t]) => { if (!N[a] || !N[b] || !kin[a][t + 't']) return; kin[b][t + 'f'].push(a); kin[a][t + 't'].push(b); });
DATA.events.forEach(e => (e.to || []).forEach(id => N[id] && kin[id].ev.push(e.id)));
function lineage(id) {       // two generations each way along every kind of thread
  const gen = new Map([[id, 0]]), edges = [], seen = new Set(); let anc = 0, desc = 0;
  [['f', 1], ['t', 0]].forEach(([dir, up]) => {
    let front = [id];
    for (let d = 1; d <= 2; d++) {
      const next = [];
      front.forEach(x => ['p', 'i', 'r'].forEach(t => kin[x][t + dir].forEach(o => {
        const a = up ? o : x, b = up ? x : o, key = a + '>' + b + '>' + t;
        if (!seen.has(key)) { seen.add(key); edges.push({a, b, t, d, sw: ((a.length * 31 + b.length * 17 + a.charCodeAt(0) + b.charCodeAt(b.length - 1)) % 20) / 10 - 1}); }
        if (!gen.has(o)) { gen.set(o, d); next.push(o); if (up) anc++; else desc++; }
      })));
      front = next;
    }
  });
  const k = kin[id];
  return {gen, edges, anc, desc, direct: k.pf.length + k.pt.length + k.if.length + k.it.length + k.rf.length + k.rt.length};
}
const STRAND = new Set(['atsicomposers', 'songcountry', 'intercultural', 'dancetheatre', 'atsistage']);
const COURSES = {"mwat1":{"name":"HSC Preliminary year · Music 2 · MWAT1 Student Studio Manual, Part I (Baroque)","stops":[{"id":"motet","week":"Weeks 0–1","pages":"pp. 4–9","works":["Palestrina, Sicut cervus"],"role":"Major teaching repertoire"},{"id":"groundbass","week":"Weeks 1–2","pages":"pp. 7–12","works":["Monteverdi, Lamento della ninfa"],"role":"Spine work 1"},{"id":"monody","week":"Week 2","pages":"pp. 10–12","works":["Caccini, “Amarilli, mia bella” (Le nuove musiche, 1602)"],"role":"Major teaching repertoire"},{"id":"opera","week":"Week 3","pages":"pp. 13–15","works":["Purcell, Dido’s Lament"],"role":"Spine work 3"},{"id":"toccata","week":"Weeks 4 and 7","pages":"pp. 16–18, 26–28","works":["Bach, Prelude in C, BWV 846"],"role":"Major teaching repertoire"},{"id":"cantata","week":"Weeks 4 and 7","pages":"pp. 16–18, 26–28","works":["Bach, BWV 140 chorale"],"role":"Major teaching repertoire"},{"id":"comedieballet","week":"Week 5","pages":"pp. 19–21","works":["Lully, Le Bourgeois gentilhomme: Ouverture, Menuet, Marche pour la cérémonie des Turcs"],"role":"Major teaching repertoire"},{"id":"suite","week":"Week 5","pages":"p. 22","works":["Jacquet de La Guerre, Suite No. 1 in D minor (1687): Prélude, Sarabande, Gigue, Chaconne L’Inconstante"],"role":"Spine work 2"},{"id":"concertogrosso","week":"Week 6","pages":"pp. 23–25","works":["Corelli, Op. 6 No. 8, Christmas Concerto (II. Allegro)"],"role":"Major teaching repertoire"},{"id":"soloconcerto","week":"Week 6","pages":"pp. 23–25","works":["Vivaldi, Spring, RV 269, I"],"role":"Spine work 4"},{"id":"fugue","week":"Week 8","pages":"pp. 29–31","works":["Bach, Little Fugue in G minor, BWV 578","Bach, Invention No. 1, BWV 772 (optional)"],"role":"Spine work 5"}],"extra":[{"week":"Week 9","pages":"pp. 32–33","note":"Affekt and performance practice: contrasting recordings of the five spine works."},{"week":"Week 10","pages":"pp. 34–35","note":"Unfamiliar Baroque excerpt: any form on the map outside this route is a source."}]},"mwat1c":{"name":"HSC Preliminary year · Music 2 · MWAT1 Student Studio Manual, Part II (Classical) with the Classical Repertoire Learning Series","stops":[{"id":"variations","week":"Week 1","pages":"MWAT1 pp. 42–46 · Booklet II, Duration","works":["Haydn, Symphony No. 94 ‘Surprise’, II"],"role":"Deep study 1"},{"id":"clsonata","week":"Week 2","pages":"MWAT1 pp. 47–48 · Booklet IV, Dynamics","works":["Beethoven, ‘Pathétique’ Sonata, Op. 13, I"],"role":"Focal study"},{"id":"divertimento","week":"Week 3","pages":"MWAT1 pp. 49–53 · Booklet III, Pitch","works":["Mozart, Eine kleine Nachtmusik, K. 525, I"],"role":"Deep study 2"},{"id":"clconcerto","week":"Week 4","pages":"MWAT1 pp. 54–55 · Booklet V, Timbre","works":["Mozart, Piano Concerto No. 21, K. 467, II"],"role":"Focal study"},{"id":"symphony","week":"Week 5","pages":"MWAT1 pp. 56–60 · Booklet I, Structure","works":["Beethoven, Symphony No. 5, Op. 67, I"],"role":"Deep study 3"}],"extra":[{"week":"Weeks 0–1","pages":"MWAT1 pp. 38–41","note":"Mind map v1, diagnostic listening, the Classical repertoire map and the phrase and cadence laboratory. The galant style is where the balanced Classical phrase came from.","go":["galant"]},{"week":"Week 6","pages":"MWAT1 p. 61","note":"Performance laboratory: style as evidence. Any Classical panel can supply the piece."},{"week":"Week 7","pages":"MWAT1 p. 62","note":"Unfamiliar Classical source: any Classical form outside this route is a source."},{"week":"Week 8","pages":"MWAT1 pp. 63–64","note":"Classical portfolio, Composer’s Toolkit and mind map v2."},{"week":"Further listening","pages":"Booklets I, IV and V","note":"Works from the booklets’ further listening that sit on the map: Mozart, Symphony No. 40; Beethoven, ‘Moonlight’ Sonata; Mozart, Sinfonia concertante, K. 364.","go":["symphony","fantasia","symconc"]}]},"mwat1r":{"name":"HSC Preliminary year · Music 2 · MWAT1 Student Studio Manual, Part III (Romantic)","stops":[{"id":"romsym","week":"Week 1","pages":"MWAT1 pp. 70–74","works":["Schubert, Symphony No. 8 in B minor, D. 759, ‘Unfinished’, I"],"role":"Deep study 1"},{"id":"progsym","week":"Week 2","pages":"MWAT1 pp. 75–79","works":["Berlioz, Symphonie fantastique, Op. 14: the idée fixe"],"role":"Deep study 2"},{"id":"romlied","week":"Week 3","pages":"MWAT1 pp. 80–84","works":["Schumann, Dichterliebe, Op. 48"],"role":"Deep study 3"},{"id":"lyricpiece","week":"Week 4","pages":"MWAT1 pp. 85–86","works":["Mussorgsky, Pictures at an Exhibition: Promenade and a contrasting picture"],"role":"Focal study"},{"id":"nationalorch","week":"Week 5","pages":"MWAT1 pp. 87–88","works":["Dvořák, Symphony No. 9 in E minor, Op. 95, ‘From the New World’, IV"],"role":"Focal study"}],"extra":[{"week":"Weeks 0–1","pages":"MWAT1 pp. 66–69","note":"Mind map v1, diagnostic listening, the Romantic repertoire map and the identity and instability laboratory. Inherited forms remain: compare the Classical symphony with what Schubert does to it.","go":["symphony"]},{"week":"Week 6","pages":"MWAT1 p. 89","note":"Performance laboratory: style as evidence. Any Romantic panel can supply the piece."},{"week":"Week 7","pages":"MWAT1 p. 90","note":"Unfamiliar Romantic source: any Romantic form outside this route is a source."},{"week":"Week 8","pages":"MWAT1 pp. 91–92","note":"Romantic portfolio, Composer’s Toolkit and mind map v2."},{"week":"Connections","pages":"On the map","note":"Where the five works lead: Liszt’s thematic transformation in the symphonic poem, the French mélodie beside the Lied, and Dvořák’s American years beside the concert spiritual.","go":["sympoem","melodie","spiritual"]}]},"m20c":{"name":"HSC Preliminary year · Music 2 · Music of the 20th and 21st centuries (proposed unit)","stops":[{"id":"impressionism","week":"Week 1","pages":"Proposed unit","works":["Debussy, Prélude à l’après-midi d’un faune"],"role":"Deep study 1"},{"id":"balletsrusses","week":"Week 2","pages":"Proposed unit","works":["Stravinsky, The Rite of Spring: ‘Augurs of Spring’ and ‘Sacrificial Dance’"],"role":"Deep study 2"},{"id":"sprechstimme","week":"Week 3","pages":"Proposed unit","works":["Schoenberg, Pierrot lunaire, Op. 21"],"role":"Deep study 3"},{"id":"concertjazz","week":"Week 4","pages":"Proposed unit","works":["Gershwin, Rhapsody in Blue"],"role":"Focal study"},{"id":"modquartet","week":"Week 5","pages":"Proposed unit","works":["Messiaen, Quartet for the End of Time (Quatuor pour la fin du temps)"],"role":"Focal study"}],"extra":[{"week":"About this route","pages":"Proposed","note":"A proposed Year 11 unit for the focus area Music of the 20th and 21st centuries, built from the map rather than from a manual. Weeks, works and roles are a draft for Justin to swap or reorder."},{"week":"Weeks 0–1","pages":"Proposed unit","note":"Mind map v1 and diagnostic listening: the end of a late Romantic symphony beside the flute solo that opens the Faune. What has happened to tonality, metre and the orchestra?","go":["postromsym","sympoem"]},{"week":"Week 6","pages":"Proposed unit","note":"Performance laboratory: style as evidence. Build and perform a short modernist texture: a layered ostinato after the Rite, a whole-tone or pentatonic melody after Debussy, a line of speech-song after Pierrot."},{"week":"Week 7","pages":"Proposed unit","note":"Unfamiliar Modernism source: any Modernism form outside this route is a source."},{"week":"Week 8","pages":"Proposed unit","note":"Portfolio, Composer’s Toolkit and mind map v2."},{"week":"Australian row","pages":"On the map","note":"Grainger’s folk-song settings, Glanville-Hicks’s song cycle Profiles from China (1945) and Sutherland’s First String Quartet (1938): Australian composers working inside, and against, the European and English styles of the route.","go":["folksong","postromsong","modquartet"]},{"week":"Connections","pages":"On the map","note":"Where the five works lead: Stravinsky’s turn to neoclassicism after the Rite, Schoenberg’s twelve-tone method after Pierrot, Gershwin beside the American symphonic voice, and Messiaen’s faith in modern sacred choral music.","go":["neoclassicism","twelvetone","amsym","modsacred"]}]},"l25":{"name":"HSC year · Music 1 and Music 2 · Music of the last 25 years (Australian focus)","stops":[{"id":"ausorch","week":"Week 1","pages":"suggested sequence","works":["Holly Harrison, Frumious (2013)"],"role":"Opening study: hybridising rock and metal with the orchestra"},{"id":"concertonow","week":"Week 2","pages":"suggested sequence","works":["Brett Dean, The Lost Art of Letter Writing (2007)"],"role":"Core study 1 (art music). Core studies 1–4 meet Music 2’s four contrasting works by four composers, three art music and one from another style"},{"id":"ausmodern","week":"Week 3","pages":"suggested sequence","works":["Liza Lim, How Forests Think (2016)"],"role":"Core study 2 (art music): sheng soloist, extended techniques"},{"id":"atsicomposers","week":"Week 4","pages":"suggested sequence","works":["William Barton, Birdsong at Dusk (2006)","alternative: Deborah Cheetham Fraillon, Eumeralla (2019)"],"role":"Core study 3 (art music): listening and the composer’s own words, no imitation"},{"id":"intercultural","week":"Week 5","pages":"suggested sequence","works":["Gurrumul, Djarimirri (Child of the Rainbow) (2018)"],"role":"Core study 4 (another style): production, orchestral arranging, Yolŋu song"},{"id":"digiscores","week":"Week 6","pages":"suggested sequence","works":["Cat Hope, Speechless (2019)"],"role":"Non-traditional notation; performance and composition model"},{"id":"generative","week":"Week 7","pages":"suggested sequence","works":["Uncanny Valley, Beautiful the World (2020)"],"role":"Digital technologies, distribution and audience; composition model"},{"id":"artjazz","week":"Week 8","pages":"suggested sequence","works":["Andrea Keller, Transients Volume 1 (2019)"],"role":"Improvisation and performer-directed frameworks (alternative Core study 4)"},{"id":"vocalens","week":"Week 9","pages":"suggested sequence","works":["Robert Davidson, Not now, not ever (2014)","global comparison: Caroline Shaw, Partita for 8 Voices (2012)"],"role":"Speech melody; Australian and global works side by side"},{"id":"screengame","week":"Week 10","pages":"suggested sequence","works":["Antony Partos, Animal Kingdom (2010)"],"role":"Music 1 bridge: music for screen"},{"id":"conmusical","week":"Week 10","pages":"suggested sequence","works":["Kate Miller-Heidke and Keir Nuttall, Muriel’s Wedding the Musical (2017)"],"role":"Music 1 bridge: stage and popular styles"}],"extra":[{"week":"Requirements","pages":"Music 2 (2025)","note":"Music 2 (2025): students study a minimum of four contrasting works from four different composers, including three works of art music and one work from another style. All works here date from 2003 or later; each card flags a work once it falls outside the window.","go":[]}]},"t-mass":{"group":"Threads","name":"Thread: the Mass, c.900 to today","stops":[{"id":"chant","week":"c.900","pages":"","works":["Puer natus est nobis (Introit for Christmas Day)"],"role":"The Mass begins as chant: each day’s texts are sung to plainchant melodies"},{"id":"trope","week":"c.1000","pages":"","works":["Kyrie Cunctipotens genitor Deus (troped Kyrie)"],"role":"Singers add new words and music inside the Mass chants"},{"id":"medmass","week":"c.1360","pages":"","works":["Machaut, Messe de Nostre Dame"],"role":"Polyphony for the whole Ordinary; Machaut’s is the earliest complete setting known by one named composer"},{"id":"renmass","week":"c.1455","pages":"","works":["Du Fay, Missa Se la face ay pale"],"role":"A whole Mass built on one borrowed melody, here Du Fay’s own song"},{"id":"counterref","week":"1567","pages":"","works":["Palestrina, Missa Papae Marcelli"],"role":"Clear words after the Council of Trent; the story that this Mass saved polyphony is a legend"},{"id":"mass","week":"1749","pages":"","works":["J. S. Bach, Mass in B minor"],"role":"Voices, soloists and orchestra: the Latin Mass on the largest scale"},{"id":"sympmass","week":"1798","pages":"","works":["Haydn, “Nelson Mass”","Mozart, Requiem"],"role":"The Mass sounds like a symphony with voices"},{"id":"concertmass","week":"1868","pages":"","works":["Brahms, Ein deutsches Requiem","Verdi, Messa da Requiem"],"role":"The Mass and Requiem move into the concert hall; Brahms sets German Bible texts instead of the Latin"},{"id":"modsacred","week":"1921","pages":"","works":["Vaughan Williams, Mass in G minor"],"role":"Unaccompanied voices look back to Tudor church music"},{"id":"pwsacred","week":"1962","pages":"","works":["Britten, War Requiem"],"role":"The Latin Requiem set beside Wilfred Owen’s war poems"},{"id":"holymin","week":"1997","pages":"","works":["Roxanna Panufnik, Westminster Mass"],"role":"The Mass is still written for the liturgy, here for Westminster Cathedral’s choir"}]},"t-quartet":{"group":"Threads","name":"Thread: the string quartet, c.1620 to today","stops":[{"id":"viol","week":"c.1620","pages":"","works":["Gibbons, Fantazies of III Parts"],"role":"Before the quartet: equal voices in a consort of viols"},{"id":"triosonata","week":"1681","pages":"","works":["Corelli, Trio Sonatas, Op. 1"],"role":"Two violins over a bass line: the texture the quartet grew from"},{"id":"divertimento","week":"c.1765","pages":"","works":["Haydn, Divertimento in C, ‘Der Geburtstag’"],"role":"Light music in several movements; Haydn’s earliest quartets were called divertimenti"},{"id":"quartet","week":"1781","pages":"","works":["Haydn, Op. 33 No. 2, ‘The Joke’","Mozart, K. 421"],"role":"Four equal players in conversation"},{"id":"romquartet","week":"1824","pages":"","works":["Schubert, ‘Death and the Maiden’","Fanny Hensel, Quartet in E-flat","Dvořák, ‘American’"],"role":"Personal and national stories in four parts"},{"id":"modquartet","week":"1928","pages":"","works":["Bartók, Quartet No. 4","Ruth Crawford Seeger, String Quartet 1931"],"role":"New sounds and techniques from the same four instruments"},{"id":"pwquartet","week":"1960","pages":"","works":["Shostakovich, Quartet No. 8","Crumb, Black Angels"],"role":"Memory, war and electric strings"},{"id":"quartetnow","week":"2011","pages":"","works":["Caroline Shaw, Entr’acte","Sculthorpe, Quartet No. 16"],"role":"Today’s quartets look back to Haydn and out to the wider world"}]},"t-nation":{"group":"Threads","name":"Thread: music and nation, 1728 to today","stops":[{"id":"balladopera","week":"1728","pages":"","works":["Gay and Pepusch, The Beggar’s Opera"],"role":"Popular tunes in English set against Italian opera in London"},{"id":"nationalairs","week":"1796","pages":"","works":["“Auld Lang Syne”","Beethoven, 25 Scottish Songs"],"role":"Scottish and Irish airs collected and arranged for the home"},{"id":"nationaldance","week":"1832","pages":"","works":["Chopin, Mazurkas, Op. 7"],"role":"A Polish dance made into concert music for piano"},{"id":"rusopera","week":"1836","pages":"","works":["Glinka, A Life for the Tsar"],"role":"Opera on a Russian historical story"},{"id":"nationalorch","week":"1874","pages":"","works":["Smetana, Má vlast: Vltava","Sibelius, Finlandia"],"role":"A river, a landscape and a people in orchestral music"},{"id":"romzarzuela","week":"1894","pages":"","works":["Bretón, La verbena de la Paloma"],"role":"Spanish musical theatre about everyday Madrid"},{"id":"folksong","week":"1915","pages":"","works":["Bartók, Romanian Folk Dances","Grainger, Lincolnshire Posy"],"role":"Composers collect village songs and dances and arrange them"},{"id":"english","week":"1921","pages":"","works":["Vaughan Williams, The Lark Ascending"],"role":"An English pastoral sound"},{"id":"amsym","week":"1932","pages":"","works":["Florence Price, Symphony No. 1"],"role":"An American symphony drawing on African American song and dance"},{"id":"sovietsym","week":"1937","pages":"","works":["Shostakovich, Symphony No. 5"],"role":"A symphony written under the pressure of the Soviet state"},{"id":"newaus","week":"1961","pages":"","works":["Sculthorpe, Irkanda IV"],"role":"A search for an Australian sound; its use of Aboriginal words and music is questioned today (see the card)"},{"id":"songcountry","week":"1991","pages":"","works":["Yothu Yindi, Treaty"],"role":"Songs in language and English ask whose nation, on whose Country"},{"id":"atsicomposers","week":"2019","pages":"","works":["Deborah Cheetham Fraillon, Eumeralla, a war requiem for peace"],"role":"A requiem in Gunditjmara language for the Eumeralla wars"}]}};

/* NSW syllabus layer (approved by Justin, 12 Nov 2026). Matches are the Garden's suggestions from period, family, kind and
   date; teachers check them against the syllabus. "Last 25 years" counts back 25 years from the HSC year. */
const NSW = (() => {
  const yr = s => { const m = String(s).match(/\d{4}/); return m ? +m[0] : 0; };
  const now = new Date(), nextHSC = now.getMonth() >= 10 ? now.getFullYear() + 1 : now.getFullYear();
  const newHSC = Math.max(nextHSC, 2028);
  const S = a => new Set(a), lant = gid => { const x = (MIN.genres || []).find(z => z.id === gid); return x ? x.lanterns : []; };
  const JAZZ = S(['ragjazzpiano', 'concertjazz', 'thirdstream', 'artjazz']), GLOBAL = S(['globalfusion', 'intercultural', 'commons']);
  const TECH = S(['concrete', 'synth', 'electroac', 'generative', 'digiscores', 'soundscape']), NOTATE = S(['chance', 'digiscores']);
  const EDU = S(['schools', 'schoolsmusic']), BRIDGE = S(['goldmusical', 'conmusical', 'folkrevival', 'songcountry', 'atsistage', 'globalfusion']);
  let DANCE = null, SCREEN = null;
  const dance = () => DANCE || (DANCE = S(lant('g-ballet').concat(['dancepairs', 'estampie', 'nationaldance'])));
  const screen = () => SCREEN || (SCREEN = S(lant('g-screen').concat(['filmscore', 'pwfilm', 'screengame'])));
  const per = (...p) => n => p.includes(n.period), aus = n => ((FULL[n.id] || {}).au || []).length > 0 || ['newaus', 'ausorch', 'ausmodern'].includes(n.id);
  const ausMost = n => n.kind === 'Region' || ((FULL[n.id] || {}).au || []).length * 2 >= n.works.length;
  const inWin = (n, y) => n.works.some(w => yr(w[2]) >= y - 25), beforeWin = (n, y) => n.works.some(w => yr(w[2]) && yr(w[2]) < y - 25);
  const strand = n => STRAND.has(n.id);
  const A = [];
  const add = (grp, key, t, f) => A.push({grp, key, t, f});
  const M2 = 'Music 2 (2025, from 2027)', M1 = 'Music 1 (2025, from 2027)';
  add(M2, 'm2-wat1', 'Y11 Music of Western art traditions 1 (1600–1900)', per('baroque', 'classical', 'romantic'));
  add(M2, 'm2-dme', 'Y11 Music for drama, movement and entertainment', n => n.lane === 'stage');
  add(M2, 'm2-2021', 'Y11 Music of the 20th and 21st centuries', per('modern', 'postwar', 'contemporary'));
  add(M2, 'm2-l25', `Y12 Music of the last 25 years (Australian focus), HSC ${newHSC}`, n => inWin(n, newHSC));
  add(M2, 'm2-wat2', 'Y12 Music of Western art traditions 2 (1600 to 25 years ago)', n => per('baroque', 'classical', 'romantic', 'modern', 'postwar')(n) || (n.period === 'contemporary' && beforeWin(n, newHSC)));
  add(M2, 'm2-el-atsi', 'Y12 Elective: music of Aboriginal and/or Torres Strait Islander Peoples', strand);
  add(M2, 'm2-el-global', 'Y12 Elective: music of global cultures and traditions', n => GLOBAL.has(n.id));
  add(M2, 'm2-el-jazz', 'Y12 Elective: jazz', n => JAZZ.has(n.id));
  add(M2, 'm2-el-early', 'Y12 Elective: early music (pre 1600)', per('medieval', 'renaissance'));
  add(M2, 'm2-el-bar', 'Y12 Elective: music of the Baroque period', per('baroque'));
  add(M2, 'm2-el-cla', 'Y12 Elective: music of the Classical period', per('classical'));
  add(M2, 'm2-el-rom', 'Y12 Elective: music of the Romantic period', per('romantic'));
  add(M2, 'm2-el-20', 'Y12 Elective: music of the 20th century', n => per('modern', 'postwar')(n) || (n.period === 'contemporary' && n.works.some(w => yr(w[2]) && yr(w[2]) < 2001)));
  add(M2, 'm2-el-21', 'Y12 Elective: music of the 21st century', n => n.works.some(w => yr(w[2]) >= 2001));
  add(M1, 'm1-l25', `Y12 Music of the last 25 years (Australian focus), HSC ${newHSC}`, n => inWin(n, newHSC));
  add(M1, 'm1-x-style', 'Y12 Across cultures, traditions and time: music of a style', n => n.kind === 'Style');
  add(M1, 'm1-x-region', 'Y12 Across cultures, traditions and time: music of a region', ausMost);
  add(M1, 'm1-x-culture', 'Y12 Across cultures, traditions and time: music of a culture', n => strand(n) || GLOBAL.has(n.id));
  add(M1, 'm1-x-trad', 'Y12 Across cultures, traditions and time: music of a tradition', n => !!n.commons || n.id === 'commons' || lant('g-commons').includes(n.id));
  add(M1, 'm1-x-rel', 'Y12 Across cultures, traditions and time: music of a religion', n => n.lane === 'sacred');
  add(M1, 'm1-s-visual', 'Y12 Screen, stage and story: music for visual media', n => screen().has(n.id));
  add(M1, 'm1-s-theatre', 'Y12 Screen, stage and story: music for theatre', n => n.lane === 'stage' && !dance().has(n.id) && !screen().has(n.id));
  add(M1, 'm1-s-dance', 'Y12 Screen, stage and story: music for dance', n => dance().has(n.id));
  add(M1, 'm1-s-ritual', 'Y12 Screen, stage and story: music for ritual and ceremony', n => n.lane === 'sacred');
  add(M1, 'm1-s-story', 'Y12 Screen, stage and story: music for communication and storytelling', n => n.lane === 'song');
  Object.entries(typeof COURSES === 'object' ? COURSES : {}).forEach(([k, c]) => { const ids = new Set(c.stops.map(s => s.id)); add(c.group || 'Course routes', 'r-' + k, c.name.replace('HSC Preliminary year · ', ''), n => ids.has(n.id)); });
  const set = key => { const a = A.find(x => x.key === key); return a ? new Set(DATA.nodes.filter(a.f).map(n => n.id)) : new Set(); };
  return {A, set, yr, newHSC};
})();

/* Levels (22 Nov 2026): the Garden's own depth ladder. Data keeps the NSW stage number (4, 5, 6); display maps it. */
const LEVELS = {4: {n: 1, name: 'Seed', does: 'hear it and respond, in simple words'}, 5: {n: 2, name: 'Shoot', does: 'the elements and their context'}, 6: {n: 3, name: 'Bloom', does: 'analysis and evaluation'}};
/* Elements across curricula (22 Nov 2026). Each cell says where the Garden's element sits in that curriculum, in its own words. */
const ELX = [
  {t: 'NSW Music 7–10 (2024)', umb: 'elements of music', src: 'https://curriculum.nsw.edu.au/learning-areas/creative-arts/music-7-10-2024/overview',
    c: {dur: 'duration', pit: 'pitch', dyn: 'dynamics and expression', pmt: 'performing media and timbre', tex: 'texture', str: 'structure'}},
  {t: 'NSW Music 1 11–12 (2025, from 2027)', umb: 'no single term: they sit in Music language, under Theoretical language and Compositional language', src: 'https://curriculum.nsw.edu.au/learning-areas/creative-arts/music-1-11-12-2025/content',
    c: {dur: 'metre (simple and compound); note values and rhythmic patterns; rhythmic devices', pit: 'scales and modes; chords; chord qualities; chord progressions and cadences; melodic devices; harmonic devices', dyn: 'expressive devices', pmt: 'performing media; and a separate item for looping, sampling, delay, echo and digital reverb', tex: 'textural devices', str: 'structural devices'}},
  {t: 'NSW Music 2 and Music Extension 11–12 (2025, from 2027)', umb: 'no single term: they sit in Music language, under Theoretical language and Compositional language', src: 'https://curriculum.nsw.edu.au/learning-areas/creative-arts/music-2-11-12-2025/content/year-11/fa9ec28184',
    c: {dur: 'metre; tempo; note values and rhythm groupings; rhythmic devices', pit: 'scales, modes and tonality; chord qualities; chord progressions and cadences; melodic devices; harmonic devices', dyn: 'expressive devices', pmt: 'performing media; and a separate item for looping, sampling, delay, echo and digital reverb', tex: 'textural devices', str: 'structural devices'}},
  {t: 'Australian Curriculum v9 (F–10)', umb: 'elements of music', src: 'https://www.australiancurriculum.edu.au/curriculum-information/understand-this-learning-area/the-arts/#muskeycons',
    c: {dur: 'duration/time (including beat and rhythm)', pit: 'pitch', dyn: 'dynamics and expression', pmt: 'timbre', tex: 'texture', str: 'form and structure'}},
  {t: 'Victorian Curriculum F–10 2.0', umb: 'elements of music', src: 'https://f10.vcaa.vic.edu.au/sites/default/files/2024-10/Music%20glossary.docx',
    c: {dur: 'duration (including tempo, rhythm and metre)', pit: 'pitch', dyn: 'dynamics; articulation', pmt: 'tone colour/timbre', tex: 'texture', str: 'structure/form'}},
  {t: 'England, Key Stage 3 (national curriculum, 2013)', umb: 'the interrelated dimensions of music', src: 'https://www.gov.uk/government/publications/national-curriculum-in-england-music-programmes-of-study/national-curriculum-in-england-music-programmes-of-study',
    c: {dur: 'duration; tempo', pit: 'pitch', dyn: 'dynamics', pmt: 'timbre', tex: 'texture', str: 'structure'}},
  {t: 'England, GCSE and A level (DfE subject content)', umb: 'musical elements', src: ['https://dera.ioe.ac.uk/id/eprint/21930/1/GCSE_subject_content_for_music.pdf', 'https://dera.ioe.ac.uk/id/eprint/21927/1/GCE_AS_and_A_level_subject_content_for_music.pdf'],
    c: {dur: 'tempo, metre and rhythm', pit: 'organisation of pitch (melodically and harmonically); tonality', dyn: 'dynamics', pmt: 'sonority (GCSE puts articulation here)', tex: 'texture', str: 'structure'}},
  {t: 'USA, National Core Arts Standards (2014)', umb: 'elements of music', src: 'https://nationalartsstandards.org/sites/default/files/Music%20Glossary.pdf',
    c: {dur: 'rhythm (tempo is listed under expressive qualities)', pit: 'pitch; harmony', dyn: 'dynamics; style/articulation (dynamics, tempo and articulation are also listed as expressive qualities)', pmt: 'timbre', tex: 'texture', str: 'form'}}];
const ELX_ROWS = ['dur', 'pit', 'dyn', 'pmt', 'tex', 'str'];
function dnotice(parent, L) {      // audit 15: the warning always shows; a long list of names folds away
  if (L.length <= 12) { h('p', 'cnotice', parent, 'Aboriginal and Torres Strait Islander readers are advised that this card names people who have died: ' + L.join(', ') + '.'); return; }
  const p = h('div', 'cnotice', parent); p.setAttribute('role', 'note'); p.append('Aboriginal and Torres Strait Islander readers are advised that this card names people who have died.');
  const d = h('details', '', p); h('summary', '', d, 'Show the ' + L.length + ' names'); h('p', '', d, L.join(', ') + '.'); }
let card = null;
const FULL = ATLAS.full, GLOSS = ATLAS.glossary, GMETA = ATLAS.glossmeta, WHY = ATLAS.why, SRC = ATLAS.sources, ELEMS = ATLAS.elements, VERBS = ATLAS.keywords, KINDS = ATLAS.kinds;
const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1), elName = c => c === 'ctx' ? 'Context' : (ELEMS[c] ? ELEMS[c].name : c);
// a term in running text → its glossary key, allowing simple plural and singular forms (as in the Atlas)
function glossKey(t) { const k = String(t || '').toLowerCase().replace(/\s+/g, ' ').trim(); if (!k) return null; if (GLOSS[k]) return k;
  const tries = []; if (k.endsWith('ies')) tries.push(k.slice(0, -3) + 'y'); if (k.endsWith('es')) tries.push(k.slice(0, -2)); if (k.endsWith('s')) tries.push(k.slice(0, -1)); tries.push(k + 's', k + 'es'); if (k.endsWith('y')) tries.push(k.slice(0, -1) + 'ies');
  return tries.find(x => GLOSS[x]) || null; }
// text with **bold** terms; those in the glossary open their definition in place
function rich(parent, text) { String(text || '').split('**').forEach((part, i) => { if (!part) return; if (i % 2) { const key = glossKey(part); if (key) { const b = h('button', 'kw', parent, part); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.addEventListener('click', () => toggleGloss(b, key)); } else h('b', '', parent, part); } else parent.append(part); }); return parent; }
function elLabels(parent, codes) { if (!codes || !codes.length) return; const sp = h('span', 'gel', parent); codes.forEach(c => h('i', '', sp, elName(c))); }
/* Appends the optional parts of a definition to the box d (div.gdef).
   M = {listen: [strings], hear: {lantern, work, composer, where}, now: ""}
   Call it after the example paragraph and before para.after(d). Returns the wrapper, or null when M has none of the three. */
function glossExtras(d, M) {
  M = M || {};
  var listen = (M.listen || []).filter(function (s) { return s && String(s).trim(); }).slice(0, 3);
  var hear = M.hear && M.hear.work ? M.hear : null;
  var now = M.now ? String(M.now).trim() : '';
  if (!listen.length && !hear && !now) return null;
  var mk = function (tag, cls, parent, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
  var x = mk('div', 'gd-x', d);
  var part = function (cls, label) { var s = mk('div', 'gd-s ' + cls, x); mk('small', 'gd-k', s, label); return s; };
  if (listen.length) { var ul = mk('ul', '', part('gd-listen', 'Listen for')); listen.forEach(function (t) { mk('li', '', ul, String(t).trim()); }); }
  if (hear) {
    var p = mk('p', '', part('gd-hear', 'Hear it in'));
    if (hear.composer) { mk('span', 'gd-by', p, hear.composer); p.appendChild(document.createTextNode(', ')); }
    if (hear.lantern) {
      var b = mk('button', 'gd-go', p, hear.work); b.type = 'button';
      b.setAttribute('aria-label', hear.work + (hear.composer ? ', ' + hear.composer : '') + ': open its lantern');
      b.addEventListener('click', function () { if (window.__openLantern) window.__openLantern(hear.lantern); });
    } else mk('span', 'gd-by', p, hear.work);
    if (hear.where) mk('span', 'gd-wh', p, ' · ' + hear.where);
  }
  if (now) mk('p', '', part('gd-now', 'Then and now'), now);
  return x;
}

/* See it on the page: score crops in a card, each opening large in an in-page overlay.
   pagesPanel(parent, P, h, rich)
     parent  the node to append to (the "Learning about music" section)
     P       {title, intro, items:[{src, year, label, cap, credit, alt, w, h}]}  (w and h are optional pixel sizes)
     h       card.js helper h(tag, cls, parent, text)
     rich    optional card.js rich(parent, text); when given, captions in the card may carry **glossary** terms
   Returns the block, or null when there is nothing to show. DOM APIs only. */
function pagesPanel(parent, P, h, rich) {
  const items = ((P && P.items) || []).filter(it => it && it.src);
  if (!items.length) return null;
  const box = h('div', 'about pages', parent);
  h('small', '', box, P.title || 'See it on the page');
  if (P.intro) h('p', 'pg-i', box, P.intro);
  h('p', 'pg-how', box, 'Select a page to see it large.');
  const ol = h('ol', '', box);

  /* year and label run into the caption as its heading */
  const caption = (it, into, useRich) => {
    const p = h('p', 'pg-c', into);
    if (it.year) h('span', 'pg-y', p, it.year);
    if (it.label) h('b', 'pg-n', p, it.label);
    if (it.cap) { if (useRich && rich) rich(p, it.cap); else p.append(String(it.cap).split('**').join('')); }
    if (it.credit) h('p', 'pg-cr', into, it.credit);
  };
  const name = it => [it.year, it.label].filter(Boolean).join(', ');
  const size = (img, it) => { if (it.w && it.h) { img.width = it.w; img.height = it.h; } };

  items.forEach((it, i) => {
    const li = h('li', '', ol), b = h('button', 'pg-b', li), img = h('img', '', b);
    b.type = 'button'; b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-label', 'See the ' + (name(it) || 'page') + ' large');
    img.src = it.src; img.alt = it.alt || ''; img.loading = 'lazy'; img.decoding = 'async'; size(img, it);
    b.addEventListener('click', () => open(i, b));
    caption(it, li, true);
  });

  let lb = null, at = 0, from = null;
  function close() {
    if (!lb) return;
    document.removeEventListener('keydown', onKey, true);
    lb.remove(); lb = null;
    if (from && from.isConnected) from.focus();
  }
  function onKey(e) {
    if (!lb) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const st = lb.querySelector('.pg-st');
      if (document.activeElement === st && st.scrollWidth > st.clientWidth) return;      /* the arrows slide the sheet when it has the focus on a phone */
      e.preventDefault(); e.stopPropagation(); show(at + (e.key === 'ArrowRight' ? 1 : -1)); return;
    }
    if (e.key === 'Tab') {      /* keep the focus inside the overlay */
      const f = Array.from(lb.querySelectorAll('button:not([hidden]),[tabindex="0"]')), first = f[0], last = f[f.length - 1];
      if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    e.stopPropagation();      /* the map's own shortcuts stay quiet while a page is open */
  }
  function show(i) {
    if (i < 0 || i >= items.length) return;
    at = i;
    const it = items[i], st = lb.querySelector('.pg-st'), tx = lb.querySelector('.pg-tx'), img = document.createElement('img');
    const prev = lb.querySelector('.pg-pv'), next = lb.querySelector('.pg-nx'), had = document.activeElement;
    img.alt = it.alt || ''; size(img, it);
    img.addEventListener('load', () => { if (img.naturalHeight) lb.querySelector('.pg-in').style.setProperty('--ar', (img.naturalWidth / img.naturalHeight).toFixed(3)); fit(st); });      /* --ar lets the CSS keep a tall page inside a short window */
    img.src = it.src;
    st.replaceChildren(img); st.scrollLeft = 0;
    tx.replaceChildren(); caption(it, tx, false);
    lb.setAttribute('aria-label', (name(it) || 'Page') + ', page ' + (i + 1) + ' of ' + items.length);
    prev.hidden = i === 0; next.hidden = i === items.length - 1;
    if (!prev.hidden) { prev.textContent = '‹ ' + (items[i - 1].year || 'Earlier'); prev.setAttribute('aria-label', 'Earlier page: ' + name(items[i - 1])); }
    if (!next.hidden) { next.textContent = (items[i + 1].year || 'Later') + ' ›'; next.setAttribute('aria-label', 'Later page: ' + name(items[i + 1])); }
    lb.querySelector('.pg-of').textContent = (i + 1) + ' of ' + items.length;
    if (had && had.hidden) (prev.hidden ? next : prev).focus();
    fit(st);
  }
  /* on a phone the sheet is wider than the screen: make it a focusable, scrollable region and show the hint */
  function fit(st) {
    const wide = st.scrollWidth > st.clientWidth + 2;
    st.classList.toggle('wide', wide);
    if (wide) { st.tabIndex = 0; st.setAttribute('role', 'group'); st.setAttribute('aria-label', 'The page. Slide sideways to read along the line.'); }
    else { st.removeAttribute('tabindex'); st.removeAttribute('role'); st.removeAttribute('aria-label'); }
  }
  function open(i, trigger) {
    close(); from = trigger || null;
    lb = h('div', 'pg-lb', document.body); lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    const x = h('button', 'pg-x', lb, '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
    const inner = h('div', 'pg-in', lb);
    h('div', 'pg-st', inner);
    h('p', 'pg-slide', inner, 'Slide the page sideways to read along the line.');
    const ft = h('div', 'pg-ft', inner); h('div', 'pg-tx', ft);
    const nav = h('div', 'pg-nav', ft), pv = h('button', 'pg-pv', nav), of = h('span', 'pg-of', nav), nx = h('button', 'pg-nx', nav);
    pv.type = nx.type = 'button'; of.setAttribute('aria-hidden', 'true');
    if (items.length < 2) nav.hidden = true;
    pv.addEventListener('click', () => show(at - 1)); nx.addEventListener('click', () => show(at + 1));
    x.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb || e.target === inner || e.target === ft) close(); });      /* a tap outside the page and its caption closes */
    document.addEventListener('keydown', onKey, true);
    show(i);
    x.focus();
    requestAnimationFrame(() => { if (lb) lb.classList.add('on'); });
  }
  return box;
}

function toggleGloss(k, key) {
  const para = k.closest('.tags,.ecard,p,li,div'), open = k.getAttribute('aria-expanded') === 'true';
  card.querySelectorAll('.gdef').forEach(x => x.remove()); card.querySelectorAll('button.kw[aria-expanded=true]').forEach(x => x.setAttribute('aria-expanded', 'false'));
  if (open) return; k.setAttribute('aria-expanded', 'true');
  const M = GMETA[key] || {}, d = h('div', 'gdef'); d.setAttribute('role', 'note'); const hd = h('div', 'gd-h', d); h('b', '', hd, cap1(key)); elLabels(hd, M.el);
  h('p', '', d, GLOSS[key]); if (M.ex) h('p', 'gex', d, M.ex); glossExtras(d, M); if (window.__mg) window.__mg.button(d, key, 'card');
  const x = h('button', 'gx', d, '×'); x.setAttribute('aria-label', 'Close definition'); x.addEventListener('click', () => { d.remove(); k.setAttribute('aria-expanded', 'false'); });
  para.after(d);
}
function spotifyUrl(composer, title) {
  let t = String(title).replace(/[“”"]/g, '').replace(/(^|[^A-Za-zÀ-ÿ])[‘’']|[‘’'](?![A-Za-zÀ-ÿ])/g, '$1').replace(/,\s+the\s.*$/i, '').trim();
  const i = t.indexOf(':'); if (i > 0) { const after = t.slice(i + 1).trim(); t = after.split(/\s+/).length > 1 ? after : t.replace(/:\s*/, ' '); }
  t = t.replace(/\s*\([^)]*\)\s*$/, '').trim(); const sur = String(composer).trim().split(/\s+/).pop() || '';
  return 'https://open.spotify.com/search/' + encodeURIComponent((sur + ' ' + t).trim()); }
const ext = (parent, href, text, cls) => { const a = h('a', cls || '', parent, text); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; };

/* ---------- voices: every composer, as in the Garden's windows (B11) ---------- */
const TAGS = GX.TAGS || {}, REG = {A: 'Americas', U: 'Australia', E: 'Europe'};
const personOf = c => { const t = TAGS[c]; return t && t[2] ? t[2] : null; };
const yr4 = s => { const m = String(s || '').match(/\d{3,4}/); return m ? +m[0] : 9999; };
const VOICES = {}, WINS = {};
DATA.nodes.forEach(n => { const seen = new Map();
  (n.works || []).forEach((w, i) => { if (!w[1]) return; const pid = personOf(w[1]), key = pid || 's:' + w[1], tg = TAGS[w[1]] || [0, 'E', 0];
    const o = seen.get(key) || {key, pid, c: pid ? (PEOPLE[pid] || w[1]) : w[1], core: false, works: [], woman: false, region: tg[1]};
    o.core = o.core || !!w[3]; o.works.push([w, i]); o.woman = o.woman || !!tg[0]; seen.set(key, o); });
  WINS[n.id] = [...seen.values()].sort((a, b) => Math.min(...a.works.map(x => yr4(x[0][2]))) - Math.min(...b.works.map(x => yr4(x[0][2]))));
  WINS[n.id].forEach(o => { const V = VOICES[o.key] || (VOICES[o.key] = {key: o.key, name: o.c, woman: false, region: o.region, forms: []}); V.woman = V.woman || o.woman; V.forms.push({id: n.id, works: o.works, core: o.core}); }); });
Object.values(VOICES).forEach(V => { V.forms.sort((a, b) => Math.min(...a.works.map(x => yr4(x[0][2]))) - Math.min(...b.works.map(x => yr4(x[0][2])))); V.first = Math.min(...V.forms.flatMap(f => f.works.map(x => yr4(x[0][2])))); V.last = Math.max(...V.forms.flatMap(f => f.works.map(x => yr4(x[0][2])).filter(y => y < 9999))); });
const DECEASED = new Set(); Object.values(FULL).forEach(f => (f.deceased || []).forEach(nm => DECEASED.add(nm)));
const voiceTags = (parent, V) => { if (V.woman) h('span', 'vt w', parent, 'woman composer'); if (REG[V.region] && V.region !== 'E') h('span', 'vt r', parent, REG[V.region]); };

/* ---------- the lantern card, in the Garden's order (G1–G11) ---------- */
const cap = s => s.replace(/^THE /, '').toLowerCase().replace(/^./, c => c.toUpperCase());
function render(panel, id, ctx) {
  card = panel; panel.textContent = ''; panel.scrollTop = 0;
  const n = N[id], F = FULL[id] || {}, k = kin[id], Lg = lineage(id), go = ctx.go;
  const nav = (parent, ref, text, cls) => { const b = h('button', cls || 'lk-b', parent, text); b.type = 'button'; b.addEventListener('click', () => go(ref)); return b; };
  const x = h('button', 'x', panel, '×'); x.setAttribute('aria-label', 'Close'); x.addEventListener('click', ctx.close);

  // G1 kicker: lantern, spire, minaret, storey; the NESA kind with its definition; the lineage count
  h('div', 'k', panel, `Lantern · ${cap(ctx.famName)} spire · ${ctx.eraName} storey`);
  h('h1', '', panel, n.t);
  h('p', 'd', panel, n.d || ''); if (F.alias) h('p', 'alias', panel, F.alias);
  const tg = h('div', 'tags', panel);
  ctx.fams.forEach(f => { const s = h('span', '', tg, cap(f.name)); s.style.background = f.c; });
  if (ctx.minaret && !ctx.minaret.toLowerCase().includes(cap(ctx.famName).toLowerCase())) h('span', 'mn', tg, ctx.minaret);
  if (n.kind && KINDS[n.kind] && !F.out) { const kb = h('button', 'kind-b', tg, n.kind); kb.type = 'button'; kb.setAttribute('aria-expanded', 'false'); kb.title = `What does ‘${n.kind}’ mean?`;
    const kd = h('p', 'kdef', panel); kd.hidden = true; h('b', '', kd, n.kind + '. '); kd.append(KINDS[n.kind]); if (F.kindNote) kd.append(' ' + F.kindNote);
    h('cite', '', kd, n.kind === 'Form' ? 'NESA Music 7–10 (2024), structure' : n.kind === 'Region' ? 'NESA Music 1 11–12 (2025), Music of a region' : 'NESA Music 11–12 (2025), Music context');
    kb.addEventListener('click', () => { kd.hidden = !kd.hidden; kb.setAttribute('aria-expanded', !kd.hidden); }); }
  h('p', 'lin', panel, `${Lg.anc} before · ${Lg.desc} after · ${Lg.direct} direct link${Lg.direct === 1 ? '' : 's'}`);

  // G2 notices: deceased persons, cultural protocols, the artist's own voice
  if ((F.deceased || []).length) dnotice(panel, F.deceased);
  if (F.protocol) { const pn = h('div', 'pnotice', panel); pn.setAttribute('role', 'note'); h('b', '', pn, 'Cultural protocols. '); pn.append(F.protocol); }
  if (F.voice) { const bq = h('blockquote', 'voice', panel); h('p', '', bq, '“' + F.voice.quote + '”'); const ci = h('cite', '', bq, F.voice.who); if (F.voice.src) { ci.append(' · '); ext(ci, F.voice.src, 'source ↗'); } }

  if (n.brief) rich(h('p', 'brief', panel), n.brief); else if (F.note) h('p', 'brief', panel, F.note);
  if (!(n.works || []).length && !n.brief) h('p', 'status', panel, 'This form is still being researched.');

  // F5 routes: the route being walked shows this stop (with ‹ previous and next ›); every other route or thread through this lantern is one click away
  { const rname = c => c.name.replace('HSC Preliminary year · ', '').replace('Thread: ', 'Thread · '), at = c => c.stops.findIndex(s => s.id === id);
    const on = Object.entries(COURSES).filter(([, c]) => at(c) >= 0), act = on.find(([k]) => k === ctx.route);
    if (act) { const [, c] = act, i = at(c), s = c.stops[i], p = h('div', 'thread route', panel);
      h('small', '', p, `${c.group === 'Threads' ? 'Thread' : 'Course route'} · stop ${i + 1} of ${c.stops.length}`); h('p', 'rname', p, rname(c));
      h('p', '', p, `${s.week}${s.pages ? ' · ' + s.pages : ''}. ${s.role}: ${s.works.join('; ')}.`);
      const nv = h('p', 'thread-nav', p); if (i > 0 && N[c.stops[i - 1].id]) nav(nv, c.stops[i - 1].id, '‹ ' + N[c.stops[i - 1].id].t); else h('span', '', nv); if (i < c.stops.length - 1 && N[c.stops[i + 1].id]) nav(nv, c.stops[i + 1].id, N[c.stops[i + 1].id].t + ' ›');
      if (ctx.walk) { const x = h('button', 'rt-leave', p, 'Leave this route'); x.type = 'button'; x.addEventListener('click', () => ctx.walk(null)); } }
    const rest = on.filter(([k]) => k !== ctx.route);
    if (rest.length && ctx.walk) { const d = h('div', 'routes', panel); h('small', '', d, act ? 'Also on' : 'On ' + (rest.length === 1 ? 'a route' : rest.length + ' routes'));
      rest.forEach(([k, c]) => { const b = h('button', 'rt-b', d); b.type = 'button'; h('span', '', b, rname(c)); h('em', '', b, `stop ${at(c) + 1} of ${c.stops.length} · walk it ›`); b.title = 'Show this route on the map and walk it stop by stop'; b.addEventListener('click', () => ctx.walk(k)); }); } }
  // F3 styles and form bands: where this style's light fell, or where this form's band runs, each place one click away
  { const isS = (MIN.styles_as_light || []).includes(id), isB = (MIN.forms_as_bands || []).includes(id), R = (isS ? GX.REACH.styles : GX.REACH.forms)[id];
    if ((isS || isB) && (R || n.attached)) { const GT = {}; MIN.genres.forEach(g => GT[g.id] = g.t);
      h('h3', '', panel, isS ? 'Where this style reached' : 'Where this form runs');
      h('p', 'reach-note', panel, isS ? `A style is light: on the map it falls across every minaret it reached${R ? `, ${R.years[0]}–${R.years[1]}` : ''}. Each ☼ marks one documented example.` : 'A form is a gold band: on the map it ties together every minaret where it is documented. Each knot marks one example.');
      const ul = h('ul', 'reach', panel);
      if (R) R.reach.forEach(r => { const li = h('li', '', ul), b = h('button', 'lk-b', li, GT[r.minaret] || r.minaret); b.type = 'button'; b.addEventListener('click', () => ctx.reachGo && ctx.reachGo(r.minaret, r.example[2]));
        h('span', 'rx', li, ` · ${r.example[0]}${r.example[1] ? ', ' + r.example[1] : ''}${r.example[2] ? ', ' + r.example[2] : ''}`); h('span', 'why', li, r.why); });
      else n.attached.forEach(a => { if (!N[a.form]) return; const li = h('li', '', ul); nav(li, a.form, N[a.form].t); h('span', 'rx', li, ` · ${a.work}, ${a.movement}`); }); } }
  // G3 Listen: every work, with its recording, score and a Spotify search
  if ((n.works || []).length) { h('h3', '', panel, 'Listen'); const ol = h('ol', 'plist', panel);
    n.works.forEach((w, i) => { const m = (F.media || [])[i] || [], nr = m[2] === 'NO_RECORDING', li = h('li', '', ol), b = h('b', '', li, w[0]);
      if (w[3]) { const c = h('i', 'core', b, ' ★'); c.title = 'Hear this first'; c.setAttribute('aria-label', 'core work'); }
      const by = h('span', 'by', li); if (w[1]) { const key = personOf(w[1]) || 's:' + w[1], V = VOICES[key]; if (V && ctx.thread) { const tb = h('button', 'voice-b', by, w[1]); tb.type = 'button'; tb.title = V.forms.length > 1 ? `Follow ${V.name} through all ${V.forms.length} lanterns` : `${V.name}: one lantern`; tb.addEventListener('click', () => ctx.thread(key)); } else by.append(w[1]); } if (w[2]) by.append((w[1] ? ' · ' : '') + w[2]);
      if (m[2] && !nr) h('p', 'wn', li, m[2]);
      const acts = h('div', 'acts', li); if (m[0]) ext(acts, m[0], 'Listen ↗'); else h('span', 'pending', acts, 'No reliable recording yet');
      if (m[1]) ext(acts, m[1], 'Score ↗', 'score'); if (w[1]) ext(acts, spotifyUrl(w[1], w[0]), 'Spotify ↗', 'sp').title = 'Search Spotify for this work'; });
    h('p', 'pnote', panel, 'Links open in a new tab. Recordings and scores belong to their owners and are linked, not copied.'); }

  // B11 windows: the composers on this lantern; each opens a gold thread through all their lanterns
  if ((WINS[id] || []).length && ctx.thread) { h('h3', '', panel, 'Composer windows'); const box = h('div', 'wins', panel);
    WINS[id].forEach(o => { const V = VOICES[o.key], b = h('button', 'win-b' + (o.core ? ' core' : ''), box, (o.core ? '★ ' : '') + o.c); b.type = 'button';
      const nf = V ? V.forms.length : 1; h('small', '', b, nf > 1 ? ` ${nf} lanterns` : ''); if (V && V.woman) b.classList.add('wm'); b.title = nf > 1 ? `Follow ${o.c} through every lantern` : `${o.c}: this lantern only`; b.addEventListener('click', () => ctx.thread(o.key)); });
    h('p', 'pnote', panel, 'A window opens a gold thread through every lantern with a work by that composer, across every spire and storey.'); }

  // G4 Learning music: what to hear, the elements at work, a task and the evidence question
  if (F.hear || F.el || F.tryit || F.q) { h('h3', '', panel, 'Learning music');
    if (F.hear) { const ul = h('ul', 'hear', panel); F.hear.forEach(t => h('li', '', ul, t)); }
    const codes = (F.el || []).concat(Object.keys(F.elx || {}).filter(c => !(F.el || []).includes(c)));
    if (codes.length) { const els = h('div', 'els', panel); els.setAttribute('role', 'group'); els.setAttribute('aria-label', 'Elements of music at work'); const slot = h('div', 'ecard-slot');
      codes.forEach(c => { const b = h('button', (F.el || []).includes(c) ? '' : 'more', els, elName(c)); b.type = 'button'; b.setAttribute('aria-expanded', 'false');
        b.addEventListener('click', () => { const was = b.getAttribute('aria-expanded') === 'true'; els.querySelectorAll(':scope>button').forEach(z => z.setAttribute('aria-expanded', 'false')); slot.textContent = ''; if (was) return; b.setAttribute('aria-expanded', 'true');
          const El = ELEMS[c] || {name: elName(c), def: '', vocab: []}, ec = h('div', 'ecard', slot), tx = (F.elx || {})[c]; h('b', '', ec, El.name); if (El.def) h('p', 'edef', ec, El.def);
          if (tx) rich(h('p', '', ec), tx);
          if ((El.vocab || []).length) { const tags = h('div', 'tags', ec); El.vocab.forEach(v => { const key = glossKey(v); if (key) { const kb = h('button', 'kw', tags, v); kb.type = 'button'; kb.setAttribute('aria-expanded', 'false'); kb.addEventListener('click', () => toggleGloss(kb, key)); } else h('span', '', tags, v); }); }
          const xx = h('button', 'gx', ec, '×'); xx.setAttribute('aria-label', 'Close'); xx.addEventListener('click', () => { slot.textContent = ''; b.setAttribute('aria-expanded', 'false'); }); }); });
      els.appendChild(slot); }
    if (F.tryit) { const t = h('div', 'box', panel); h('small', '', t, 'Try it · ' + (F.tryType === 'compose' ? 'composing' : F.tryType === 'perform' ? 'performing' : 'listening')); h('p', '', t, F.tryit); }
    if (F.q) { const t = h('div', 'box q', panel); h('small', '', t, 'Evidence question'); h('p', '', t, F.q); } }

  // G5 Answer like an analyst: Seed, Shoot and Bloom questions (stored as stage 4, 5, 6)
  if ((F.qs || []).length) { h('h3', '', panel, 'Answer like an analyst'); const ol = h('ol', 'qs', panel);
    F.qs.slice().sort((a, b) => a.stage - b.stage).forEach(q => { const li = h('li', '', ol), qm = h('div', 'qm', li), v = VERBS[q.verb] || {w: cap1(q.verb), def: ''}, w = n.works[q.work], m = w ? (F.media || [])[q.work] || [] : [];
      { const L = LEVELS[q.stage] || LEVELS[4], lc = h('span', 'st', qm, L.name); lc.title = 'Level ' + L.n + ' · ' + L.name + ': ' + L.does; }
            h('span', 'verb', qm, v.w).title = v.def; elLabels(qm, q.el); h('p', 'qt', li, q.q);
      if (q.stage === 6 && /^(Analyse|Evaluate) /.test(q.q)) { const d1 = h('p', 'qt m1y11', li), c1 = h('span', 'crs', d1, 'Simpler'); c1.title = 'The same question one step gentler: describe instead of analyse or evaluate'; d1.append(' ' + q.q.replace(/^(Analyse|Evaluate) /, 'Describe ')); }
      if (w) { const lw = h('p', 'lw', li); h('b', '', lw, 'Listen to '); if (m[0]) ext(lw, m[0], w[0] + ' ↗'); else lw.append(w[0]); lw.append(', ' + w[1] + (m[2] === 'NO_RECORDING' ? ' (no reliable recording yet; try its Spotify search above)' : '')); }
      if (q.hint) { const d = h('details', '', li); h('summary', '', d, 'Hint'); rich(h('p', '', d), q.hint); }
      if (q.research) { const r = h('div', 'research', li); h('small', '', r, 'Research challenge'); rich(h('p', '', r), q.research); } });      // an optional task that sends the student out to find a source for themselves
    if ((ATLAS.ladder || []).length) { const d = h('details', 'ladder-d', panel); h('summary', '', d, 'What a strong answer does'); const lo = h('ol', '', d); ATLAS.ladder.forEach(r => { const li = h('li', '', lo); h('b', '', li, r.h + ' '); li.append(r.p); });
      if ((ATLAS.checklist || []).length) { h('p', '', d, 'Check before you hand it in:'); const cu = h('ul', '', d); ATLAS.checklist.forEach(c => h('li', '', cu, c)); } } }

  // G6 the Garden's own sections: how the design adapts, where a band runs, threads through time
  if (n.adapts) { h('h3', '', panel, 'How the design adapts'); n.adapts.forEach(a => { const p = h('p', 'adapt', panel); h('b', '', p, (a.genre || a.t || '') + ' '); rich(p, a.text || ''); if (a.example) h('em', '', p, ' ' + a.example); }); }
  if (n.attached) { h('h3', '', panel, 'Where the band runs'); const ul = h('ul', '', panel); n.attached.forEach(a => { const li = h('li', '', ul); h('cite', '', li, a.work); li.append(`, ${a.movement} · `); if (N[a.form]) nav(li, a.form, N[a.form].t); }); }

  // G10 NSW syllabus · for teachers (the Garden's suggestions, to check against the syllabus)
  { const d = h('details', 'nsw', panel); h('summary', '', d, 'Curriculum links · for teachers'); const box = h('div', 'nsw-in', d);
    { const p = h('p', '', box); h('b', '', p, 'Levels: '); p.append('Seed (Level 1) hears and responds in simple words; Shoot (Level 2) works with the elements and their context; Bloom (Level 3) analyses and evaluates.'); }
    h('h4', 'cl-h', box, 'New South Wales');
    { const p = h('p', '', box); h('b', '', p, 'Levels in NSW: '); p.append('Seed = Stage 4 (Years 7–8) · Shoot = Stage 5 (Years 9–10) · Bloom = Stage 6 (Years 11–12: Music 1, Music 2; Music Extension in Year 12).'); }
    if ((F.qs || []).some(q => q.stage === 6)) { const p = h('p', '', box); h('b', '', p, 'Bloom questions in NSW (2025 syllabuses): '); p.append('analyse and explain questions suit Music 1 Year 12 (MU1-12L-01: analyses the ways Music context and Music language shape music) and Music 2 Year 11 (MU2-11L-01: analyses the ways Music context and Music language shape meaning in musical pieces); evaluate questions suit Music 2 Year 12 (MU2-12L-01: evaluates the ways Music context and Music language shape meaning and expressive intent in musical pieces). Each “Simpler” line suits Music 1 Year 11 (MU1-11L-01: describes the ways Music context and Music language shape music).'); }
    const row = t => { const p = h('p', '', box); h('b', '', p, t + ' '); return p; }, tt = F.tryType;
    const s45 = ['MU4-LIS-01', 'MU5-LIS-01', 'MU5-LIS-02'].concat(tt === 'perform' ? ['MU4-PER-01', 'MU5-PER-01'] : tt === 'compose' ? ['MU4-COM-01', 'MU5-COM-01'] : []);
    row('Stages 4–5, Music 7–10 (2024):').append(s45.join(' · '));
    const grpRow = (grp, codes, first) => { const hits = NSW.A.filter(a => a.grp === grp && a.f(n)); if (!hits.length && !first) return; row(grp + ':'); const ul = h('ul', '', box); if (first) h('li', '', ul, first);
      hits.forEach(a => { const li = h('li', '', ul, a.t); const c = codes ? codes(a.t) : ''; if (c) { li.append(' '); h('code', '', li, c); } }); };
    const cM2 = t => t.startsWith('Y11') ? 'MU2-11L-01 · MU2-11L-02' + (tt === 'compose' ? ' · MU2-11C-02' : '') : 'MU2-12L-01 · MU2-12L-02' + (tt === 'compose' ? ' · MU2-12C-02' : '');
    const cM1 = t => t.startsWith('Y12') ? 'MU1-12L-01 · MU1-12L-02' + (tt === 'compose' ? ' · MU1-12C-02' : '') : '';
    grpRow('Music 2 (2025, from 2027)', cM2); grpRow('Music 1 (2025, from 2027)', cM1, 'Y11 Contexts of music, Creative practice and Music in focus can draw on any form (MU1-11L-01 · MU1-11L-02)');
    if (['modern', 'postwar', 'contemporary'].includes(n.period)) [[NSW.newHSC, '2025 syllabuses']].forEach(([y, lab]) => { if (!y) return;
      const inw = n.works.filter(w => NSW.yr(w[2]) >= y - 25), oldCore = n.works.filter(w => w[3] && NSW.yr(w[2]) && NSW.yr(w[2]) < y - 25);
      const p = row(`Last 25 years, HSC ${y} (${lab}), from ${y - 25}:`); p.append(inw.length ? inw.map(w => w[0]).join('; ') + '.' : 'no works on this card fall inside it.');
      if (inw.length && oldCore.length) h('em', '', p, ` Hear-first works older than the window: ${oldCore.map(w => w[0]).join('; ')}.`); });
    Object.values(COURSES).filter(c => !c.group).forEach(c => { c.stops.filter(s => s.id === id).forEach(s => { const p = row('Course route:'); h('i', '', p, c.name); p.append(`: ${s.week}, ${s.pages}. ${s.role}: ${s.works.join('; ')}.`); });
      (c.extra || []).filter(e => (e.go || []).includes(id)).forEach(e => { const p = row('Course route:'); h('i', '', p, c.name); p.append(`: ${e.week}, ${e.pages}. ${e.note}`); }); });
    const xd = h('details', 'nsw-x', box); h('summary', '', xd, 'Elements across curricula');
    { const sel = h('select', 'cl-pick', xd); sel.setAttribute('aria-label', 'Choose a curriculum'); ELX.forEach((c, k) => { const o = h('option', '', sel, c.t); o.value = k; });
      const um = h('p', 'nsw-note', xd), tb = h('table', '', xd), src = h('p', 'nsw-note', xd);
      const draw = () => { const c = ELX[+sel.value] || ELX[0]; um.textContent = 'What it calls them: ' + c.umb + '.'; tb.textContent = ''; const hr = h('tr', '', tb); h('th', '', hr, 'The Garden'); h('th', '', hr, c.t);
        ELX_ROWS.forEach(e => { const tr = h('tr', '', tb); h('td', '', tr, elName(e)); h('td', '', tr, c.c[e] || '—'); }); src.textContent = ''; src.append('Source: '); [].concat(c.src).forEach((u, k) => { if (k) src.append(' · '); ext(src, u, (k ? 'A level' : c.t) + ' ↗'); }); };
      sel.addEventListener('change', draw); draw();
      h('p', 'nsw-note', xd, 'Each curriculum groups things a little differently. A cell shows where the Garden’s element sits in that curriculum, in its own words.'); }
    h('p', 'nsw-note', box, 'Matches are the Garden’s suggestions from each form’s period, family, kind and dates: check them against the syllabus. The last 25 years counts back from the HSC year.'); }
  if (F.teacher || F.teacherNote) { const t = h('p', 'tnote', panel); h('b', '', t, 'For teachers. '); t.append(F.teacher || F.teacherNote); }

  // G7 Learning about music (folded)
  if (F.figures || F.centres || F.who || F.where || F.tech || F.now || F.deep) { const sec = h('details', 'sec', panel); h('summary', '', sec, 'Learning about music');
    if (F.figures) { const d = h('div', 'people', sec); h('small', '', d, 'Key figures'); h('p', '', d, F.figures.join(' · ')); }
    if (F.centres) { const d = h('div', 'people', sec); h('small', '', d, 'Centres'); h('p', '', d, F.centres.join(' · ')); }
    [['Who made it, who paid', F.who], ['Where it was heard', F.where], ['Technology', F.tech], ['Then and now', F.now], ['Bloom · going deeper', F.deep]].forEach(([t, v]) => { if (!v) return; const d = h('div', 'about', sec); h('small', '', d, t); rich(h('p', '', d), v); if (t === 'Technology' && F.pages) pagesPanel(sec, F.pages, h, rich); }); }

  // G8 Connections, each with the Garden's reason (folded, open by default)
  if (Lg.direct + k.ev.length) { const sec = h('details', 'sec', panel); sec.open = true; h('summary', '', sec, 'Connections');
    [['Grew from', k.pf, 'n'], ['Borrowed from', k.if, 'n'], ['Pushed against', k.rf, 'n'], ['Gave rise to', k.pt, 'n'], ['Influenced', k.it, 'n'], ['Provoked a reaction in', k.rt, 'n'], ['Made possible by', k.ev, 'e']].forEach(([label, ids, kind]) => {
      ids = ids.filter(z => kind === 'e' ? E[z] : N[z]); if (!ids.length) return; const g = h('div', 'conn-g', sec); h('small', '', g, label); const ul = h('ul', '', g);
      ids.forEach(z => { const li = h('li', '', ul); if (kind === 'n') nav(li, z, N[z].t); else if (ctx.event) { const eb = h('button', 'lk-b ev-b', li, `◆ ${E[z].t}`); eb.type = 'button'; eb.addEventListener('click', () => ctx.event(z)); li.append(` (${E[z].d})`); } else h('b', 'ev', li, `${E[z].t} (${E[z].d})`);
        const why = kind === 'e' ? (E[z].why || '') : (WHY[z + '>' + id] || WHY[id + '>' + z] || ''); if (why) h('span', 'why', li, why); }); }); }

  // G9 Sources
  if ((SRC[id] || []).length) { const d = h('details', 'sec', panel); h('summary', '', d, 'Sources'); const ul = h('ul', 'src', d); SRC[id].forEach(r => h('li', '', ul, r)); }
  if (F.hear) h('p', 'status', panel, 'Dates give the year at least two composers were working in the form; the first experiments usually come a little earlier.');
  // G11 respect and contact
  h('p', 'respect', panel, 'This Garden is presented with respect for every musician and culture it includes. To raise a cultural concern or report an incorrect link, contact Justin Ossher, the creator of this Garden, at any time.'); { const lv = h('p', 'living', panel, 'This is a living document in the form of an interactive page. Please e-mail '); const a = h('a', '', lv, 'shmungfroi@gmail.com'); a.href = 'mailto:shmungfroi@gmail.com'; lv.append(' to make any suggestions, comments or corrections.'); }
}
function renderComposer(panel, key, ctx) {
  card = panel; panel.textContent = ''; panel.scrollTop = 0; const V = VOICES[key]; if (!V) return;
  const x = h('button', 'x', panel, '×'); x.setAttribute('aria-label', 'Close'); x.addEventListener('click', ctx.close);
  const spires = new Set(V.forms.map(f => ctx.famOf(f.id)));
  h('div', 'k', panel, 'Voice · composer window');
  h('h1', '', panel, V.name);
  h('p', 'd', panel, V.first < 9999 ? (V.first === V.last || !isFinite(V.last) ? `${V.first}` : `${V.first}–${V.last}`) + ' · works on the map' : '');
  const tg = h('div', 'tags', panel); voiceTags(tg, V);
  h('p', 'lin', panel, `${V.forms.length} lantern${V.forms.length === 1 ? '' : 's'} across ${spires.size} spire${spires.size === 1 ? '' : 's'} · the gold thread joins them, oldest first`);
  if (DECEASED.has(V.name)) dnotice(panel, [V.name]);
  h('h3', '', panel, 'The thread, lantern by lantern'); const ol = h('ol', 'thr', panel);
  V.forms.forEach(f => { const n = N[f.id], F = FULL[f.id] || {}, li = h('li', '', ol), hd = h('div', 'thr-h', li);
    const b = h('button', 'lk-b', hd, n.t); b.type = 'button'; b.addEventListener('click', () => ctx.go(f.id)); h('small', '', hd, ` ${cap(ctx.famName(f.id))} spire · ${ctx.eraName(f.id)}`);
    f.works.forEach(([w, i]) => { const m = (F.media || [])[i] || [], d = h('div', 'thr-w', li), t = h('b', '', d, w[0]); if (w[3]) h('i', 'core', t, ' ★'); if (w[2]) h('span', 'by', d, w[2]);
      const acts = h('div', 'acts', d); if (m[0]) ext(acts, m[0], 'Listen ↗'); if (m[1]) ext(acts, m[1], 'Score ↗', 'score'); ext(acts, spotifyUrl(w[1], w[0]), 'Spotify ↗', 'sp'); }); });
  h('p', 'pnote', panel, 'Links open in a new tab. Recordings and scores belong to their owners and are linked, not copied.');
  h('p', 'respect', panel, 'This Garden is presented with respect for every musician and culture it includes. To raise a cultural concern or report an incorrect link, contact Justin Ossher, the creator of this Garden, at any time.'); { const lv = h('p', 'living', panel, 'This is a living document in the form of an interactive page. Please e-mail '); const a = h('a', '', lv, 'shmungfroi@gmail.com'); a.href = 'mailto:shmungfroi@gmail.com'; lv.append(' to make any suggestions, comments or corrections.'); }
}
function renderEvent(panel, eid, ctx) {
  card = panel; panel.textContent = ''; panel.scrollTop = 0; const e = E[eid]; if (!e) return;
  const x = h('button', 'x', panel, '×'); x.setAttribute('aria-label', 'Close'); x.addEventListener('click', ctx.close);
  h('div', 'k', panel, 'Event · history & technology');
  h('h1', '', panel, e.t); h('p', 'd', panel, [e.d, e.place].filter(Boolean).join(' · '));
  const to = (e.to || []).filter(i => N[i]); h('p', 'lin', panel, `made possible ${to.length} lantern${to.length === 1 ? '' : 's'}`);
  if ((e.deceased || []).length) dnotice(panel, e.deceased);
  if (e.what) rich(h('p', 'brief', panel), e.what);
  if (e.why) { h('h3', '', panel, 'Why it matters for music'); rich(h('p', '', panel), e.why); }
  if (to.length) { h('h3', '', panel, 'Made possible'); const ul = h('ul', 'evto', panel);
    to.slice().sort((a, b) => N[a].y - N[b].y).forEach(i => { const li = h('li', '', ul), b = h('button', 'lk-b', li, N[i].t); b.type = 'button'; b.addEventListener('click', () => ctx.go(i)); h('small', '', li, ` ${N[i].d} · ${cap(ctx.famName(i))} spire`); }); }
  h('p', 'respect', panel, 'This Garden is presented with respect for every musician and culture it includes. To raise a cultural concern or report an incorrect link, contact Justin Ossher, the creator of this Garden, at any time.'); { const lv = h('p', 'living', panel, 'This is a living document in the form of an interactive page. Please e-mail '); const a = h('a', '', lv, 'shmungfroi@gmail.com'); a.href = 'mailto:shmungfroi@gmail.com'; lv.append(' to make any suggestions, comments or corrections.'); }
}
window.GardenCard = {render, renderComposer, renderEvent, VOICES, voiceTags, EVENTS: E, NSW, STRAND, COURSES, WINS, LEVELS, ELX, glossKey, gloss: (b, key, root) => { card = root; toggleGloss(b, key); }};
})();
