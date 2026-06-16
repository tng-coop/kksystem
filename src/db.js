import Database from 'better-sqlite3';
import { dirname,join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize the database in the root folder
const db = new Database(join(__dirname, '..', 'kksystem.db'), { verbose: console.log });
db.pragma('journal_mode = WAL');

const initializeDb = () => {
  // Members Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      join_date DATE,
      address TEXT,
      address2 TEXT,
      send_dm INTEGER DEFAULT 1,
      is_living INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      department TEXT,
      annual_fee_status TEXT DEFAULT 'unpaid',
      is_cooperator INTEGER DEFAULT 0,
      cert_issued INTEGER DEFAULT 0,
      kananame TEXT,
      gender TEXT,
      postal TEXT,
      phone TEXT,
      district TEXT,
      delivery TEXT,
      quit_date DATE,
      dob DATE,
      remarks TEXT,
      hope TEXT,
      emergency_name TEXT,
      emergency_zip TEXT,
      emergency_address TEXT,
      emergency_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add columns to existing table if they don't exist (migrations)
  try { db.exec(`ALTER TABLE members ADD COLUMN address TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN address2 TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN send_dm INTEGER DEFAULT 1`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN is_living INTEGER DEFAULT 1`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN department TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN annual_fee_status TEXT DEFAULT 'unpaid'`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN is_cooperator INTEGER DEFAULT 0`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN cert_issued INTEGER DEFAULT 0`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN kananame TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN gender TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN postal TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN phone TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN district TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN delivery TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN quit_date DATE`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN dob DATE`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN remarks TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN hope TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN emergency_name TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN emergency_zip TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN emergency_address TEXT`); } catch { /* column exists */ }
  try { db.exec(`ALTER TABLE members ADD COLUMN emergency_phone TEXT`); } catch { /* column exists */ }

  // Capital Contributions (Pay-ins) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS capital_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      pay_date DATE NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(member_id) REFERENCES members(id)
    )
  `);

  console.log('Database schema initialized.');

  // Idempotent Data Seeding (Japanese Locale)
  const seedMembers = [
    { 
      name: '田中 太郎', 
      email: 'taro.tanaka@example.jp', 
      join_date: '2023-04-01', 
      address: '東京都渋谷区...', 
      address2: 'コーポ101',
      send_dm: 1,
      department: '地域支援部', 
      annual_fee_status: 'paid', 
      is_cooperator: 0, 
      cert_issued: 1,
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
      department: '介護福祉部', 
      annual_fee_status: 'unpaid', 
      is_cooperator: 0, 
      cert_issued: 0,
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
      department: '総務管理部', 
      annual_fee_status: 'paid', 
      is_cooperator: 0, 
      cert_issued: 1,
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
    },
    { 
      name: '高橋 健二', 
      email: 'kenji.takahashi@example.jp', 
      join_date: '2024-01-15', 
      address: '東京都世田谷区...', 
      address2: null,
      send_dm: 1,
      department: '地域支援部', 
      annual_fee_status: 'paid', 
      is_cooperator: 1, 
      cert_issued: 0,
      kananame: 'タカハシケンジ',
      gender: '1',
      postal: '154-0011',
      phone: '03-9876-5432',
      district: '世田谷南',
      delivery: '14',
      quit_date: null,
      dob: '1990-07-20',
      remarks: '新規サポーター',
      hope: 'ボランティア参加希望',
      emergency_name: '高橋 洋子',
      emergency_zip: '154-0011',
      emergency_address: '東京都世田谷区...',
      emergency_phone: '090-7777-8888',
      contribs: [] 
    }
  ];

  const checkMember = db.prepare('SELECT id FROM members WHERE email = ?');
  const insertMember = db.prepare(`
    INSERT INTO members (
      name, email, join_date, address, address2, send_dm, is_living, status, department, annual_fee_status, is_cooperator, cert_issued,
      kananame, gender, postal, phone, district, delivery, quit_date, dob, remarks, hope, emergency_name, emergency_zip, emergency_address, emergency_phone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertContrib = db.prepare('INSERT INTO capital_contributions (member_id, amount, pay_date, notes) VALUES (?, ?, ?, ?)');

  let addedCount = 0;
  for (const seed of seedMembers) {
    const existing = checkMember.get(seed.email);
    if (!existing) {
      const result = insertMember.run(
        seed.name,
        seed.email,
        seed.join_date,
        seed.address,
        seed.address2,
        seed.send_dm,
        1,
        'active',
        seed.department,
        seed.annual_fee_status,
        seed.is_cooperator,
        seed.cert_issued,
        seed.kananame,
        seed.gender,
        seed.postal,
        seed.phone,
        seed.district,
        seed.delivery,
        seed.quit_date,
        seed.dob,
        seed.remarks,
        seed.hope,
        seed.emergency_name,
        seed.emergency_zip,
        seed.emergency_address,
        seed.emergency_phone
      );
      for (const c of seed.contribs) {
        insertContrib.run(result.lastInsertRowid, c.amount, c.date, c.notes);
      }
      addedCount++;
    }
  }

  if (addedCount > 0) {
    console.log(`Seeded ${addedCount} initial demo members.`);
  }
};

initializeDb();

export default db;
