export type Member = {
  uid: number;
  hn: string;
  name: string;
  pref: string;
  instagram: string;
  x: string;
  status: string;
  attended: Record<string, string>; // 'A' = GPZ1000RX, 'B' = ZX-10, '' = not attended
};

export type DisplayMember = {
  uid: number;
  displayName: string;
  url: string | null;
  pref: string;
  type: string;
};

const rawMembers: Member[] = [
  { uid: 1,  hn: '',             name: 'おおばたけ', pref: '神奈川県', instagram: 'zx10.ketabawo',               x: 'ketabawo',          status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 2,  hn: '',             name: 'しらいし',   pref: '千葉県',   instagram: 'shiraishidrea55',             x: '',                  status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': 'B', '4': 'A', '5': '',  '6': 'B' } },
  { uid: 3,  hn: '',             name: 'むらた',     pref: '神奈川県', instagram: '2hours_motercycle_rx1000gpz', x: 'yuji101567',        status: 'ACTIVE',   attended: { '1': 'A', '2': 'A', '3': 'A', '4': 'A', '5': '',  '6': 'A' } },
  { uid: 4,  hn: '',             name: 'ひらおか',   pref: '神奈川県', instagram: 'eisuke55',                    x: '',                  status: 'ACTIVE',   attended: { '1': 'A', '2': 'A', '3': 'A', '4': 'A', '5': '',  '6': 'A' } },
  { uid: 5,  hn: 'まつ',         name: 'まつお',     pref: '千葉県',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': 'A', '2': 'A', '3': 'A', '4': 'A', '5': '',  '6': 'A' } },
  { uid: 6,  hn: '',             name: 'おおしま',   pref: '東京都',   instagram: 'oshima_rx24',                 x: '',                  status: 'ACTIVE',   attended: { '1': 'A', '2': 'A', '3': '',  '4': '',  '5': '',  '6': 'A' } },
  { uid: 7,  hn: '',             name: 'かねたか',   pref: '東京都',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': 'A', '2': 'A', '3': 'A', '4': 'A', '5': '',  '6': 'A' } },
  { uid: 8,  hn: '',             name: 'はらさわ',   pref: '東京都',   instagram: '_m.52.6',                     x: '19770622',          status: 'ACTIVE',   attended: { '1': 'A', '2': 'A', '3': 'A', '4': 'A', '5': '',  '6': 'A' } },
  { uid: 9,  hn: '',             name: 'まえざわ',   pref: '千葉県',   instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': 'A', '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 10, hn: '',             name: 'ながた',     pref: '東京都',   instagram: 'bevitore_asakusa',            x: 'ZX10BLUE',          status: 'ACTIVE',   attended: { '1': 'B', '2': '',  '3': '',  '4': '',  '5': '',  '6': 'B' } },
  { uid: 11, hn: '',             name: '',           pref: '神奈川県', instagram: '',                            x: 'ZXT00BGHCF3',       status: 'UNKNOWN',  attended: { '1': 'B', '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 12, hn: '',             name: '',           pref: '神奈川県', instagram: '',                            x: 'PONTAEX2',          status: 'UNKNOWN',  attended: { '1': 'B', '2': '',  '3': '',  '4': '',  '5': '',  '6': 'B' } },
  { uid: 13, hn: '',             name: '',           pref: '千葉県',   instagram: '',                            x: 'suga_mas',          status: 'ACTIVE',   attended: { '1': 'B', '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 14, hn: '',             name: 'すずき',     pref: '東京都',   instagram: 'nee_253yazz',                 x: '253Nee',            status: 'ACTIVE',   attended: { '1': 'B', '2': '',  '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 15, hn: '',             name: '',           pref: '東京都',   instagram: 'sc30nabe',                    x: '',                  status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': 'B', '4': 'B', '5': '',  '6': ''  } },
  { uid: 16, hn: '',             name: 'しらいし',   pref: '大阪府',   instagram: 'brothersho_zx10_nc2rht',      x: 'brothersho',        status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 17, hn: '',             name: '',           pref: '神奈川県', instagram: '',                            x: '_yon_suke',         status: 'UNKNOWN',  attended: { '1': 'B', '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 18, hn: '',             name: 'たての',     pref: '埼玉県',   instagram: '',                            x: 'hetero_1941',       status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': '',  '4': '',  '5': '',  '6': 'B' } },
  { uid: 19, hn: '',             name: '',           pref: '千葉県',   instagram: 'avancer.j',                   x: 'jun2jet',           status: 'ACTIVE',   attended: { '1': 'B', '2': '',  '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 20, hn: '',             name: '',           pref: '神奈川県', instagram: 'oyaji_monstr',                x: '',                  status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': '',  '4': 'B', '5': '',  '6': 'B' } },
  { uid: 21, hn: '',             name: 'そのだ',     pref: '千葉県',   instagram: '',                            x: 'sonopee1105',       status: 'ACTIVE',   attended: { '1': 'B', '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 22, hn: '',             name: 'こばやし',   pref: '神奈川県', instagram: 'kozo.koba',                   x: '',                  status: 'ACTIVE',   attended: { '1': 'B', '2': 'B', '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 23, hn: '',             name: 'いとう',     pref: '東京都',   instagram: 'yasuhiro8316zx10',            x: 'AkEmYy6osoNsxCV',   status: 'BANNED',   attended: { '1': 'B', '2': '',  '3': '',  '4': 'B', '5': '',  '6': ''  } },
  { uid: 24, hn: '',             name: 'とよふく',   pref: '千葉県',   instagram: 'hajime_10429',                x: 'hajime_toyofuku',   status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': '',  '4': 'B', '5': '',  '6': ''  } },
  { uid: 25, hn: '',             name: '',           pref: '神奈川県', instagram: '',                            x: 'backy5126',         status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 26, hn: '',             name: 'すずき',     pref: '山梨県',   instagram: 'gpz1000rx_tra',               x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'A', '3': '',  '4': 'A', '5': '',  '6': 'A' } },
  { uid: 27, hn: '',             name: '',           pref: '神奈川県', instagram: 'osushirou',                   x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': 'A', '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 28, hn: '',             name: 'ひらもと',   pref: '神奈川県', instagram: 'teruteru.power.power',        x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': '',  '4': 'B', '5': '',  '6': ''  } },
  { uid: 29, hn: '',             name: 'くりはら',   pref: '東京都',   instagram: 'kurihara.zx10',               x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': '',  '4': 'B', '5': '',  '6': ''  } },
  { uid: 30, hn: '',             name: 'ゆうき',     pref: '千葉県',   instagram: 'zzr14003103',                 x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 31, hn: '',             name: 'はやし',     pref: '千葉県',   instagram: 'taihong908',                  x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'A', '3': 'A', '4': '',  '5': '',  '6': 'B' } },
  { uid: 32, hn: '',             name: 'よねかわ',   pref: '東京都',   instagram: 'tamyyjanuary',                x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'A', '3': '',  '4': 'A', '5': '',  '6': 'A' } },
  { uid: 33, hn: '',             name: '',           pref: '神奈川県', instagram: 'misty.g_misteee',             x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'A', '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 34, hn: '',             name: 'つのだ',     pref: '神奈川県', instagram: '',                            x: 'TUNO33690203',      status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': '',  '4': 'B', '5': '',  '6': 'B' } },
  { uid: 35, hn: '',             name: 'おがさわら', pref: '埼玉県',   instagram: 'ogasawaraippei',              x: 'MagicCarpet39',     status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 36, hn: '',             name: 'こんどう',   pref: '静岡県',   instagram: 'konpei104405',                x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': 'B', '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 37, hn: 'Shin_1',       name: '',           pref: '神奈川県', instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': 'A', '3': 'A', '4': '',  '5': '',  '6': ''  } },
  { uid: 38, hn: '',             name: 'さかもと',   pref: '群馬県',   instagram: 'xgpz',                        x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': 'A', '4': '',  '5': '',  '6': 'A' } },
  { uid: 39, hn: 'ふじとし',     name: '',           pref: '神奈川県', instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': '',  '3': 'A', '4': '',  '5': '',  '6': ''  } },
  { uid: 40, hn: '',             name: '',           pref: '群馬県',   instagram: 'nigezou',                     x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': 'A', '4': '',  '5': '',  '6': ''  } },
  { uid: 41, hn: '',             name: 'やの',       pref: '東京都',   instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': '',  '3': 'A', '4': '',  '5': '',  '6': ''  } },
  { uid: 42, hn: '淡水鯱',       name: '',           pref: '長野県',   instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': '',  '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 43, hn: '岩附',         name: '',           pref: '神奈川県', instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': '',  '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 44, hn: '',             name: '',           pref: '静岡県',   instagram: 'neko.555',                    x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': '',  '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 45, hn: '',             name: 'かりの',     pref: '神奈川県', instagram: 'kakikukezx10',                x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 46, hn: '',             name: 'かめい',     pref: '静岡県',   instagram: 'ookame55',                    x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': 'B', '4': 'B', '5': '',  '6': 'B' } },
  { uid: 47, hn: 'コタロー',     name: '',           pref: '東京都',   instagram: '',                            x: '',                  status: 'UNKNOWN',  attended: { '1': '',  '2': '',  '3': 'B', '4': '',  '5': '',  '6': ''  } },
  { uid: 48, hn: '',             name: 'やはぎ',     pref: '東京都',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': 'A', '5': '',  '6': ''  } },
  { uid: 49, hn: '',             name: 'いせや',     pref: '東京都',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': 'A', '5': '',  '6': ''  } },
  { uid: 50, hn: '',             name: 'いのうえ',   pref: '東京都',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': 'B', '5': '',  '6': ''  } },
  { uid: 51, hn: 'ひでかず',     name: '',           pref: '東京都',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': 'B', '5': '',  '6': ''  } },
  { uid: 52, hn: 'トムキャット', name: 'ふるさわ',   pref: '新潟県',   instagram: '',                            x: 'Z3rvVINyUvk3OqL',   status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': 'B' } },
  { uid: 53, hn: '',             name: 'なかお',     pref: '東京都',   instagram: 'zxt00b3',                     x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': 'B' } },
  { uid: 54, hn: '',             name: 'つじ',       pref: '栃木県',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': 'A' } },
  { uid: 55, hn: 'タイリョウ工業', name: 'こやなぎ', pref: '埼玉県',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': 'A' } },
  { uid: 56, hn: 'かりやど',     name: 'かりごめ',   pref: '神奈川県', instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': 'B' } },
  { uid: 57, hn: '',             name: 'いまえ',     pref: '千葉県',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': 'A' } },
  { uid: 58, hn: '',             name: '',           pref: '栃木県',   instagram: 'koji.sugai',                  x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 59, hn: '',             name: '',           pref: '東京都',   instagram: 'nakayamake_dairumi',          x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
  { uid: 60, hn: '息子氏',       name: '',           pref: '東京都',   instagram: '',                            x: '',                  status: 'ACTIVE',   attended: { '1': '',  '2': '',  '3': '',  '4': '',  '5': '',  '6': ''  } },
];

export function getMemberByUid(uid: number): Omit<DisplayMember, 'type'> | null {
  const m = rawMembers.find(rm => rm.uid === uid);
  if (!m) return null;

  let displayName = '';
  let url: string | null = null;

  if (m.instagram) {
    displayName = m.instagram;
    url = `https://www.instagram.com/${m.instagram}/`;
  } else if (m.x) {
    displayName = m.x;
    url = `https://x.com/${m.x}`;
  } else {
    displayName = m.hn || m.name || '—';
    url = null;
  }

  return { uid: m.uid, displayName, url, pref: m.pref };
}

export function getNewVsReturningForEvent(eventId: string): { newCount: number; returningCount: number } {
  const attended = rawMembers.filter(m => !!m.attended[eventId]);
  let newCount = 0;
  let returningCount = 0;
  for (const m of attended) {
    const pastAttendance = Object.entries(m.attended)
      .filter(([eid, val]) => eid !== eventId && !!val);
    if (pastAttendance.length === 0) newCount++;
    else returningCount++;
  }
  return { newCount, returningCount };
}

export function getMembersForEvent(eventId: string): DisplayMember[] {
  return rawMembers
    .filter(m => !!m.attended[eventId])
    .map(m => {
      let displayName = '';
      let url: string | null = null;

      if (m.instagram) {
        displayName = m.instagram;
        url = `https://www.instagram.com/${m.instagram}/`;
      } else if (m.x) {
        displayName = m.x;
        url = `https://x.com/${m.x}`;
      } else {
        displayName = m.hn || m.name || '—';
        url = null;
      }

      const type = m.attended[eventId] === 'A' ? 'GPZ1000RX' : 'ZX-10';

      return { uid: m.uid, displayName, url, pref: m.pref, type };
    });
}
