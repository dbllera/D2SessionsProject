/* Artifact content. To add an artifact: add an entry here with a `build` key
   naming a builder in ./builders (or write a new builder), and a `media` block
   the panel knows how to render (see renderMedia in ../panel.ts). */
import type { Artifact } from './types';

const LETTER_TEXT =
  'Dear future student,\n\nYou will feel behind in your first month. Everyone does, and almost nobody says so.\n\nEat in the dining hall alone at least once and sit down with strangers. Learn the name of one tree on campus. Call home at a strange hour. Twelve hours apart means someone is always just waking up.\n\nThe work will get done. The people are the part you cannot make up later.\n\nFrom a student who was once as nervous as you';

export const ARTIFACTS: Artifact[] = [
  {
    id: 'audio',
    no: '01',
    theme: 'Audio Memories',
    title: 'Rain on the Quad',
    origin: 'Duke University, Durham',
    format: 'Audio station',
    pos: [4.55, 1.15, 2.6],
    radius: 2.3,
    build: 'audioStation',
    ry: -Math.PI / 2,
    description:
      'A listening post beside the bookcases. A Duke student remembers the afternoon a rainstorm introduced her to her closest friend.',
    media: {
      type: 'speech',
      label: 'Play recording',
      parts: [
        {
          pitch: 1.05,
          text: 'It was the second week of my first semester, and it rained so hard that the quad turned into a mirror. I was hiding under the arches outside the library with someone I had never met, both of us pretending to check our phones. Eventually she laughed and said, we are going to be late either way. So we walked. We were soaked by the time we reached class, and she has been my closest friend ever since. Whenever it rains now, I think about how close I came to waiting it out alone.',
        },
      ],
    },
  },
  {
    id: 'letter',
    no: '02',
    theme: 'Letters to Future Students',
    title: 'To Whoever Sits Here Next',
    origin: 'Duke Kunshan University, Kunshan',
    format: 'Open letter on a reading table',
    pos: [1.5, 0.85, 8.5],
    radius: 2.0,
    build: 'letter',
    description:
      'A handwritten letter left on a reading table by a DKU student at the end of a semester in Durham, addressed to someone they will never meet.',
    media: { type: 'letter', text: LETTER_TEXT },
  },
  {
    id: 'capsule',
    no: '03',
    theme: 'Shared Memory Capsule',
    title: 'Two First Days',
    origin: 'Duke and Duke Kunshan, recorded together',
    format: 'Glass display case',
    pos: [0, 1.15, -14.2],
    radius: 2.4,
    build: 'displayCase',
    description:
      'Two students describe arriving on their own campus for the first time. Read side by side, the same small moments keep appearing.',
    media: {
      type: 'capsule',
      motifs: ['Suitcase wheels', 'Getting lost', 'A stranger who helped', 'The first meal'],
      sides: [
        {
          cls: 'duke',
          place: 'Durham',
          who: 'A Duke student',
          pitch: 1.1,
          text: 'My suitcase wheels were so loud on the stone path that I carried the bag the last hundred metres. I got lost looking for my dorm, and a sophomore walked me there without being asked. Dinner was a biscuit bigger than my hand.',
        },
        {
          cls: 'dku',
          place: 'Kunshan',
          who: 'A DKU student',
          pitch: 0.85,
          text: 'I remember the sound of suitcase wheels on the bridge over the water, dozens of us arriving at once. I could not find the academic building, and a security guard drew me a map on the back of a receipt. Dinner was soup dumplings, and I burned my tongue on the first one.',
        },
      ],
    },
  },
  {
    id: 'food',
    no: '04',
    theme: 'Culture and Food',
    title: 'What We Ate When We Missed Home',
    origin: 'Duke and Duke Kunshan',
    format: 'Framed photographs',
    pos: [-5.35, 1.6, -3.8],
    radius: 2.5,
    build: 'frames',
    description:
      'Three framed meals with a note from the person who chose each one. The images are illustrated stand-ins for photographs students will contribute.',
    media: {
      type: 'gallery',
      items: [
        {
          title: 'Sunday dumplings',
          from: 'Kunshan',
          cls: 'dku',
          text: 'Six of us folded these in a dorm kitchen with one cutting board. Mine fell apart in the pot and nobody let me forget it.',
        },
        {
          title: 'Barbecue after the game',
          from: 'Durham',
          cls: 'duke',
          text: 'My roommate insisted this was the real welcome to North Carolina. I still think about the cornbread.',
        },
        {
          title: 'Mooncakes in the common room',
          from: 'Durham',
          cls: 'duke',
          text: 'A visiting DKU student brought a box for Mid-Autumn Festival and cut each one into eight pieces so the whole floor could try them.',
        },
      ],
    },
  },
  {
    id: 'qa',
    no: '05',
    theme: 'Question and Answer Archive',
    title: 'Questions Across Twelve Hours',
    origin: 'Duke and Duke Kunshan',
    format: 'Journal on a lectern',
    pos: [-3.7, 1.15, 14.5],
    radius: 2.3,
    build: 'lectern',
    ry: Math.PI / 2,
    description:
      'An open journal where students on one campus leave a question and students on the other answer it, often half a day later.',
    media: {
      type: 'qa',
      items: [
        {
          q: 'What do you eat when you are homesick?',
          qf: 'Asked from Durham',
          a: 'Tomato and egg over rice. It takes ten minutes and tastes like my kitchen at home.',
          af: 'Answered from Kunshan',
          qc: 'duke',
          ac: 'dku',
        },
        {
          q: 'What does your campus sound like at night?',
          qf: 'Asked from Kunshan',
          a: 'Crickets, the chapel bells on the hour, and someone practising trumpet badly.',
          af: 'Answered from Durham',
          qc: 'dku',
          ac: 'duke',
        },
        {
          q: 'Where do you go when you need to be alone?',
          qf: 'Asked from Durham',
          a: 'The path beside the water behind the library. Early, before the first class.',
          af: 'Answered from Kunshan',
          qc: 'duke',
          ac: 'dku',
        },
        {
          q: 'What surprised you most about the other campus?',
          qf: 'Asked from Kunshan',
          a: 'How old it tries to look. Then you find out the stone is younger than my grandmother.',
          af: 'Answered from Durham',
          qc: 'dku',
          ac: 'duke',
        },
      ],
    },
  },
  {
    id: 'media',
    no: '06',
    theme: 'Media and Music',
    title: 'A Playlist for the Time Difference',
    origin: 'Duke and Duke Kunshan',
    format: 'Display set into the bookcases',
    pos: [4.95, 1.45, -13],
    radius: 2.6,
    build: 'screen',
    description:
      'Short pieces of music that students said sound like their campus at a particular hour. These sketches are generated in the browser as stand-ins.',
    media: {
      type: 'tracks',
      items: [
        {
          title: 'Chapel Bells at Five',
          from: 'Durham, late afternoon',
          cls: 'duke',
          text: 'Slow and bright, for the walk back across the quad.',
        },
        {
          title: 'Canal Lights',
          from: 'Kunshan, after dark',
          cls: 'dku',
          text: 'A plucked melody for the bridge over the water.',
        },
        {
          title: 'Half a Day Away',
          from: 'Both campuses',
          cls: '',
          text: 'One phrase, answered a moment later from the other side.',
        },
      ],
    },
  },
  {
    id: 'kville',
    no: '07',
    theme: 'Sports',
    title: 'Six Weeks in a Tent',
    origin: 'A DKU student at Duke for a semester',
    format: 'Basketball on a pedestal',
    pos: [-3.75, 1.1, 2.3],
    radius: 2.3,
    build: 'basketball',
    description:
      'A basketball and a small blue tent, left by a DKU student who spent a semester in Durham and joined a tent group in Krzyzewskiville, the line of tents outside Cameron Indoor Stadium.',
    media: {
      type: 'speech',
      label: 'Play recording',
      motifs: ['Tent checks', 'Black tenting', 'Twelve tentmates', 'Cameron at last'],
      parts: [
        {
          pitch: 0.92,
          text: 'I signed up because my roommate needed a twelfth person, and I did not want to say I had no idea what tenting was. It was January. In Kunshan I would have been home for Spring Festival. Instead I was sleeping on a foam mat in a tent on the grass, waking up to an air horn at two in the morning for tent check, running out in my coat to prove I was still there. Our group had a spreadsheet for shifts and a group chat that never slept. Someone always had hand warmers, someone always had snacks, and someone always knew a chant I did not. By the end I knew every one. When we finally walked into Cameron for the Carolina game, the noise felt like the whole building was breathing. I lost my voice in the first half. I still have the wristband. People ask me what Duke was like, and I tell them it was six weeks in a tent with eleven strangers who stopped being strangers.',
        },
      ],
    },
  },
  {
    id: 'gsoy',
    no: '08',
    theme: 'Culture and Food',
    title: 'Seven Thousand Miles, One Box',
    origin: 'A DKU student at Duke for a semester',
    format: 'Takeout box on a reading table',
    pos: [-1.6, 0.85, -9],
    radius: 2.1,
    build: 'takeout',
    description:
      'A Ginger + Soy takeout box, kept long after the meal. A DKU student remembers the October night a container of soup dumplings on West Campus made Durham feel like home.',
    media: {
      type: 'photo',
      caption: 'Soup dumplings and bao. Photo: Ginger + Soy, shared by the D2 team for this prototype.',
      paragraphs: [
        'By October I had stopped counting the hours ahead to call my mother. Kunshan was more than seven thousand miles away, and twelve hours ahead, and the food on campus was good but it was not mine.',
        'A friend from my seminar noticed I had gone quiet and walked me to Ginger + Soy. She ordered for both of us. When the soup dumplings came I did what my grandmother taught me: lift one onto the spoon, bite a small hole, drink the soup first. My friend watched and copied me, and burned her tongue anyway.',
        'They were not my grandmother\u2019s. They were close enough. I sat there longer than I needed to, and after that it became our Thursday. I kept the first box. It is a strange thing to keep, but it is the night Durham started to feel like somewhere I lived.',
      ],
      parts: [{ pitch: 0.95, text: '' }],
    },
  },
  {
    id: 'bull',
    no: '09',
    theme: 'Durham Nights',
    title: 'Two Point Three Seconds',
    origin: 'A DKU student at Duke for a semester',
    format: 'Mechanical bull on a padded ring',
    pos: [-3.0, 1.0, -12.2],
    radius: 2.7,
    build: 'bull',
    description:
      'The mechanical bull from Shooters II Saloon in Durham, a rite of passage for generations of Duke students. A DKU student explains how a short ride became the most famous part of their semester back home.',
    media: {
      type: 'speech',
      label: 'Play recording',
      motifs: ['The dial', '2.3 seconds', 'The bow', 'Grandma\u2019s question'],
      parts: [
        {
          pitch: 1.0,
          text: 'Everyone told me the bull at Shooters was a rite of passage. I assumed that was a metaphor. It was not. It was an actual bull, with horns, run by a man in a cowboy hat who controlled it with a dial and, I am fairly sure, a personal grudge. My friends filmed everything. I lasted two point three seconds, which the man announced to the whole room like a weather report. I landed on the padding, stood up, and bowed, because I did not know what else to do. People cheered louder than they had for anyone who actually stayed on. Here is the part I am proud of. It was two in the afternoon in Kunshan, so I video called my grandmother from the parking lot to explain. She watched the clip four times. Then she asked if the bull was okay. Now every time I call home, she asks about the bull. Twelve thousand kilometres, twelve hours apart, and the thing my family remembers about my semester at Duke is a bull.',
        },
      ],
    },
  },
  {
    id: 'i95',
    no: '10',
    theme: 'Culture and Food',
    title: 'A Taste of America, Outside the Gate',
    origin: 'A Duke student, nine-week summer program at DKU',
    format: 'Food truck menu board',
    real: true,
    pos: [3.75, 1.2, -2.3],
    radius: 2.8,
    build: 'menuBoard',
    description:
      'The menu from I95 Burger, a burger truck parked right outside the DKU campus. For one Duke student spending nine weeks in Kunshan, it was the taste of home they needed near the end of the summer.',
    media: {
      type: 'menu',
      paragraphs: [
        'I spent nine weeks at DKU this past summer. The first few flew by. By the end, I was more homesick than I expected to be, missing the small, ordinary things from home that I had never thought about before.',
        'Right outside campus there was a burger truck, I95 Burger. A smashburger with cheese, crispy edges, a soft bun, eaten standing outside the truck. It tasted like America. It was such a small thing, but it was so refreshing to have something that felt like home when I needed it most.',
        'Half a world away from Durham, a burger truck named after the highway that runs past it is part of how I remember my summer in China.',
      ],
      items: [
        ['\u829d\u58eb\u725b\u8089\u6c49\u5821', 'Cheeseburger', '26'],
        ['\u51e4\u68a8\u829d\u58eb\u725b\u8089\u6c49\u5821', 'Pineapple cheeseburger', '29'],
        ['\u51e4\u68a8\u52a0\u86cb\u829d\u58eb\u725b\u8089\u6c49\u5821', 'Pineapple and egg cheeseburger', '32'],
        ['\u53cc\u5c42\u829d\u58eb\u725b\u8089\u6c49\u5821', 'Double cheeseburger', '39'],
      ],
      extras: [
        ['\u51e4\u68a8', 'Pineapple', '3'],
        ['\u9e21\u86cb', 'Egg', '3'],
        ['\u829d\u58eb', 'Cheese', '3'],
        ['\u9e21\u8089', 'Chicken', '9'],
        ['\u725b\u8089', 'Beef patty', '13'],
      ],
      parts: [{ pitch: 1.0, text: '' }],
    },
  },
];
ARTIFACTS[9].media.parts[0].text = ARTIFACTS[9].media.paragraphs.join(' ');
ARTIFACTS[7].media.parts[0].text = ARTIFACTS[7].media.paragraphs.join(' ');
