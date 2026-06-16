// src/demoData.js
// LocalStorage mock backend for Demo Mode

const STORAGE_KEY = 'kksystem_demo_data';
const DEMO_DATA_VERSION = 'v3_japanese';

// Internal utility to read/write from localStorage
const loadData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
};

const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Initialize sequence
export const initDemoData = () => {
    const isE2e = import.meta.env.VITE_IS_E2E === 'true' || navigator.webdriver;
    const existing = loadData();
    if (existing) {
        if (existing.isE2eData === isE2e && existing.version === DEMO_DATA_VERSION) {
            return;
        }
        localStorage.removeItem(STORAGE_KEY);
    }

    if (isE2e) {
        // E2E Test Parity: Strictly 3 specific members, 210,000 total capital
        const seedMembers = [
            { 
                name: '田中 太郎', 
                email: 'taro.tanaka@example.jp', 
                join_date: '2023-04-01', 
                address: '東京都渋谷区...', 
                address2: 'コーポ101',
                send_dm: 1,
                kananame: 'タナカタロウ',
                gender: '1',
                postal: '150-0002',
                phone: '03-1234-5678',
                district: '渋谷第一',
                delivery: '11',
                quit_date: null,
                dob: '1980-01-01',
                remarks: '初期メンバーです',
                hope: '地域貢献をしたい',
                emergency_name: '田中 花子',
                emergency_zip: '150-0002',
                emergency_address: '東京都渋谷区...',
                emergency_phone: '090-1111-2222',
                contribs: [{ amount: 50000, date: '2023-04-01', notes: '初期出資金' }, { amount: 10000, date: '2023-12-01', notes: '追加出資' }] 
            },
            { 
                name: '佐藤 花子', 
                email: 'hanako.sato@example.jp', 
                join_date: '2023-05-15', 
                address: '神奈川県横浜市...', 
                address2: 'ヒルズ202',
                send_dm: 1,
                kananame: 'サトウハナコ',
                gender: '2',
                postal: '220-0011',
                phone: '045-123-4567',
                district: 'みなとみらい',
                delivery: '12',
                quit_date: null,
                dob: '1985-05-15',
                remarks: '介護部ヘルパー',
                hope: '研修に期待',
                emergency_name: '佐藤 健',
                emergency_zip: '220-0011',
                emergency_address: '神奈川県横浜市...',
                emergency_phone: '090-3333-4444',
                contribs: [{ amount: 50000, date: '2023-05-15', notes: '初期出資金' }] 
            },
            { 
                name: '鈴木 一郎', 
                email: 'ichiro.suzuki@example.jp', 
                join_date: '2022-10-01', 
                address: '千葉県柏市...', 
                address2: 'レジデンス303',
                send_dm: 0,
                kananame: 'スズキイチロウ',
                gender: '1',
                postal: '277-0871',
                phone: '04-7123-4567',
                district: '柏中央',
                delivery: '13',
                quit_date: null,
                dob: '1972-10-01',
                remarks: '元理事長',
                hope: '安定運営を望む',
                emergency_name: '鈴木 さくら',
                emergency_zip: '277-0871',
                emergency_address: '千葉県柏市...',
                emergency_phone: '090-5555-6666',
                contribs: [{ amount: 100000, date: '2022-10-01', notes: '初期出資金' }] 
            }
        ];

        let nextMemberId = 1; let nextContribId = 1;
        const members = []; const contributions = [];

        for (const seed of seedMembers) {
            const memberId = nextMemberId++;
            members.push({
                id: memberId,
                name: seed.name,
                email: seed.email,
                join_date: seed.join_date,
                address: seed.address,
                address2: seed.address2,
                send_dm: seed.send_dm,
                is_living: 1,
                status: 'active',
                department: seed.name === '佐藤 花子' ? '介護福祉部' : '地域支援部',
                annual_fee_status: seed.name === '佐藤 花子' ? 'unpaid' : 'paid',
                is_cooperator: 0,
                cert_issued: seed.name === '佐藤 花子' ? 0 : 1,
                kananame: seed.kananame,
                gender: seed.gender,
                postal: seed.postal,
                phone: seed.phone,
                district: seed.district,
                delivery: seed.delivery,
                quit_date: seed.quit_date,
                dob: seed.dob,
                remarks: seed.remarks,
                hope: seed.hope,
                emergency_name: seed.emergency_name,
                emergency_zip: seed.emergency_zip,
                emergency_address: seed.emergency_address,
                emergency_phone: seed.emergency_phone,
                created_at: new Date().toISOString()
            });
            for (const c of seed.contribs) contributions.push({ id: nextContribId++, member_id: memberId, amount: c.amount, pay_date: c.date, notes: c.notes, created_at: new Date().toISOString() });
        }
        saveData({ members, contributions, nextMemberId, nextContribId, isE2eData: true, version: DEMO_DATA_VERSION });
        return;
    }

    // Rich Vis Generation: 20 members, 24-month span, highly dynamic
    const seedPeople = [
        { name: '田中 太郎', kana: 'タナカ タロウ' },
        { name: '佐藤 花子', kana: 'サトウ ハナコ' },
        { name: '鈴木 一郎', kana: 'スズキ イチロウ' },
        { name: '高橋 健二', kana: 'タカハシ ケンジ' },
        { name: '渡辺 明', kana: 'ワタナベ アキラ' },
        { name: '伊藤 健太', kana: 'イトウ ケンタ' },
        { name: '山本 翔太', kana: 'ヤマモト ショウタ' },
        { name: '中村 美咲', kana: 'ナカムラ ミサキ' },
        { name: '小林 真由美', kana: 'コバヤシ マユミ' },
        { name: '加藤 拓真', kana: 'カトウ タクマ' },
        { name: '吉田 歩夢', kana: 'ヨシダ アユム' },
        { name: '山田 裕太', kana: 'ヤマダ ユウタ' },
        { name: '佐々木 翼', kana: 'ササキ ツバサ' },
        { name: '清水 優子', kana: 'シミズ ユウコ' },
        { name: '松本 蓮', kana: 'マツモト レン' },
        { name: '木村 奈々', kana: 'キムラ ナナ' },
        { name: '斎藤 拓海', kana: 'サイトウ タクミ' },
        { name: '山口 直樹', kana: 'ヤマグチ ナオキ' },
        { name: '森田 彩香', kana: 'モリタ アヤカ' },
        { name: '近藤 健介', kana: 'コンドウ ケンスケ' }
    ];
    
    let nextMemberId = 1; let nextContribId = 1;
    const members = []; const contributions = [];

    const today = new Date();
    // Deterministic random for visually stable demo charts
    let seed = 8888;
    const random = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    const randInt = (min, max) => Math.floor(random() * (max - min + 1)) + min;

    const departments = ['地域支援部', '介護福祉部', '総務管理部'];
    const neighborhoods = ['宮上', '吉浜', '土肥', '宮下', '中央', '城堀', '鍛冶屋'];

    for (let i = 0; i < seedPeople.length; i++) {
        const person = seedPeople[i];
        // Spread join dates intensely across the last 24 months
        const monthsAgoJoined = randInt(1, i < 3 ? 24 : 20); 
        const joinDate = new Date(today.getFullYear(), today.getMonth() - monthsAgoJoined, randInt(1, 28));

        const memberId = nextMemberId++;
        const isDeceased = random() > 0.95; 
        const isInactive = !isDeceased && random() > 0.85;
        const isCooperator = random() > 0.85 ? 1 : 0;
        
        const neighborhood = neighborhoods[i % neighborhoods.length];
        
        members.push({
            id: memberId, 
            name: person.name, 
            email: `yugawara.member${memberId}@example.co.jp`,
            join_date: joinDate.toISOString().split('T')[0],
            address: `神奈川県足柄下郡架空町${neighborhood} ${randInt(1, 4)}-${randInt(1, 20)}`,
            address2: `${['湯河原コーポ', 'グリーンメゾン', '宮上ハイツ', '吉浜ヒルズ'][i % 4]}${randInt(101, 305)}`,
            send_dm: random() > 0.3 ? 1 : 0,
            is_living: isDeceased ? 0 : 1, 
            status: isInactive ? 'inactive' : 'active',
            department: departments[randInt(0, 2)],
            annual_fee_status: random() > 0.35 ? 'paid' : 'unpaid',
            is_cooperator: isCooperator,
            cert_issued: random() > 0.5 ? 1 : 0,
            kananame: person.kana,
            gender: random() > 0.5 ? '1' : '2',
            postal: `259-03${randInt(11, 99)}`,
            phone: `0465-63-${String(randInt(1000, 9999))}`,
            district: `${neighborhood}地区`,
            delivery: `2${randInt(1, 2)}`,
            quit_date: null,
            dob: `19${randInt(40, 99)}-0${randInt(1, 9)}-15`,
            remarks: `Demo remarks for member ${memberId}`,
            hope: `Demo hope details for member ${memberId}`,
            emergency_name: `${person.name.split(' ')[0]} ${['洋子', '和夫', '明子', '健'][i % 4]}`,
            emergency_zip: `259-03${randInt(11, 99)}`,
            emergency_address: `神奈川県足柄下郡架空町${neighborhoods[(i + 1) % neighborhoods.length]} ${randInt(1, 4)}-${randInt(1, 20)}`,
            emergency_phone: `090-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
            created_at: joinDate.toISOString()
        });

        // 1. Every single member drops Initial Capital
        const initAmounts = [10000, 30000, 50000, 100000, 200000];
        const monthlyAmounts = [5000, 10000, 20000];
        
        contributions.push({
            id: nextContribId++, member_id: memberId,
            amount: initAmounts[randInt(0, initAmounts.length - 1)],
            pay_date: joinDate.toISOString().split('T')[0],
            notes: 'Initial Capital', created_at: joinDate.toISOString()
        });

        // 2. Active recurrent funding
        const isActiveSaver = random() > 0.4; // 60% of people contribute later
        if (isActiveSaver && !isInactive && !isDeceased) {
            for (let m = monthsAgoJoined - 1; m >= 0; m--) {
                if (random() > 0.6) { // 40% chance in any given month
                    const payDate = new Date(today.getFullYear(), today.getMonth() - m, randInt(1, 28));
                    contributions.push({
                        id: nextContribId++, member_id: memberId,
                        amount: monthlyAmounts[randInt(0, monthlyAmounts.length - 1)],
                        pay_date: payDate.toISOString().split('T')[0],
                        notes: 'Monthly Add', created_at: payDate.toISOString()
                    });
                }
            }
        }
    }

    saveData({ members, contributions, nextMemberId, nextContribId, isE2eData: false, version: DEMO_DATA_VERSION });
};

// --- API Mocks ---

// Simulate network delay to make the demo feel realistic
const delay = (ms = 300) => {
    const isE2e = import.meta.env.VITE_IS_E2E === 'true' || navigator.webdriver;
    return new Promise(resolve => setTimeout(resolve, isE2e ? 0 : ms));
};

export const demoGetMembers = async () => {
    await delay();
    const db = loadData();
    // Sort logic: ORDER BY join_date DESC
    return [...db.members].sort((a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime());
};

export const demoAddMember = async (memberData) => {
    await delay();
    const db = loadData();
    
    // Convert is_living boolean to integer 1/0 mimicking SQLite
    const isLiving = memberData.is_living === undefined ? 1 : (memberData.is_living ? 1 : 0);

    // UNIQUE constraint check
    if (memberData.email && db.members.some(m => m.email === memberData.email)) {
        throw new Error('A member with this email already exists');
    }

    const newMember = {
        id: db.nextMemberId++,
        name: memberData.name,
        email: memberData.email || null,
        join_date: memberData.join_date || null,
        address: memberData.address || null,
        address2: memberData.address2 || null,
        send_dm: memberData.send_dm === undefined ? 1 : (memberData.send_dm ? 1 : 0),
        is_living: isLiving,
        status: 'active',
        department: memberData.department || null,
        annual_fee_status: memberData.annual_fee_status || 'unpaid',
        is_cooperator: memberData.is_cooperator ? 1 : 0,
        cert_issued: memberData.cert_issued ? 1 : 0,
        kananame: memberData.kananame || null,
        gender: memberData.gender || null,
        postal: memberData.postal || null,
        phone: memberData.phone || null,
        district: memberData.district || null,
        delivery: memberData.delivery || null,
        quit_date: memberData.quit_date || null,
        dob: memberData.dob || null,
        remarks: memberData.remarks || null,
        hope: memberData.hope || null,
        emergency_name: memberData.emergency_name || null,
        emergency_zip: memberData.emergency_zip || null,
        emergency_address: memberData.emergency_address || null,
        emergency_phone: memberData.emergency_phone || null,
        created_at: new Date().toISOString()
    };

    db.members.push(newMember);
    saveData(db);
    return newMember;
};

export const demoUpdateMember = async (id, memberData) => {
    await delay();
    const db = loadData();

    const idx = db.members.findIndex(m => m.id === parseInt(id));
    if (idx === -1) throw new Error('Member not found');
    
    // UNIQUE constraint check
    if (memberData.email && db.members.some(m => m.id !== parseInt(id) && m.email === memberData.email)) {
        throw new Error('A member with this email already exists');
    }

    const isLiving = memberData.is_living ? 1 : 0;
    const status = memberData.status || 'active';

    const updated = {
        ...db.members[idx],
        name: memberData.name,
        email: memberData.email || null,
        join_date: memberData.join_date || null,
        address: memberData.address || null,
        address2: memberData.address2 !== undefined ? memberData.address2 : db.members[idx].address2,
        send_dm: memberData.send_dm !== undefined ? (memberData.send_dm ? 1 : 0) : db.members[idx].send_dm,
        is_living: isLiving,
        status: status,
        department: memberData.department !== undefined ? memberData.department : db.members[idx].department,
        annual_fee_status: memberData.annual_fee_status !== undefined ? memberData.annual_fee_status : db.members[idx].annual_fee_status,
        is_cooperator: memberData.is_cooperator !== undefined ? (memberData.is_cooperator ? 1 : 0) : db.members[idx].is_cooperator,
        cert_issued: memberData.cert_issued !== undefined ? (memberData.cert_issued ? 1 : 0) : db.members[idx].cert_issued,
        kananame: memberData.kananame !== undefined ? memberData.kananame : db.members[idx].kananame,
        gender: memberData.gender !== undefined ? memberData.gender : db.members[idx].gender,
        postal: memberData.postal !== undefined ? memberData.postal : db.members[idx].postal,
        phone: memberData.phone !== undefined ? memberData.phone : db.members[idx].phone,
        district: memberData.district !== undefined ? memberData.district : db.members[idx].district,
        delivery: memberData.delivery !== undefined ? memberData.delivery : db.members[idx].delivery,
        quit_date: memberData.quit_date !== undefined ? memberData.quit_date : db.members[idx].quit_date,
        dob: memberData.dob !== undefined ? memberData.dob : db.members[idx].dob,
        remarks: memberData.remarks !== undefined ? memberData.remarks : db.members[idx].remarks,
        hope: memberData.hope !== undefined ? memberData.hope : db.members[idx].hope,
        emergency_name: memberData.emergency_name !== undefined ? memberData.emergency_name : db.members[idx].emergency_name,
        emergency_zip: memberData.emergency_zip !== undefined ? memberData.emergency_zip : db.members[idx].emergency_zip,
        emergency_address: memberData.emergency_address !== undefined ? memberData.emergency_address : db.members[idx].emergency_address,
        emergency_phone: memberData.emergency_phone !== undefined ? memberData.emergency_phone : db.members[idx].emergency_phone
    };

    db.members[idx] = updated;
    saveData(db);
    return updated;
};

export const demoGetContributions = async () => {
    await delay();
    const db = loadData();
    
    // Join logic: SELECT c.*, m.name as member_name
    const contribs = db.contributions.map(c => {
        const member = db.members.find(m => m.id === c.member_id);
        return {
            ...c,
            member_name: member ? member.name : 'Unknown'
        };
    });

    // ORDER BY c.pay_date DESC
    return contribs.sort((a, b) => new Date(b.pay_date).getTime() - new Date(a.pay_date).getTime());
};

export const demoAddContribution = async (contribData) => {
    await delay();
    const db = loadData();

    const member = db.members.find(m => m.id === parseInt(contribData.member_id));
    if (!member) throw new Error('Member not found');

    const newContrib = {
        id: db.nextContribId++,
        member_id: parseInt(contribData.member_id),
        amount: parseFloat(contribData.amount),
        pay_date: contribData.pay_date,
        notes: contribData.notes || null,
        created_at: new Date().toISOString()
    };

    db.contributions.push(newContrib);
    saveData(db);
    return newContrib;
};

export const demoGetStats = async () => {
    await delay();
    const db = loadData();
    
    const activeMembers = db.members.filter(m => m.status === 'active').length;
    const totalCapital = db.contributions.reduce((sum, c) => sum + Number(c.amount), 0);

    return { activeMembers, totalCapital };
};
