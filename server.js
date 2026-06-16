import cors from 'cors';
import express from 'express';

import db from './src/db.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- Members API ---

// Get all members
app.get('/api/members', (req, res) => {
    try {
        const members = db.prepare('SELECT * FROM members ORDER BY join_date DESC').all();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single member
app.get('/api/members/:id', (req, res) => {
    try {
        const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }
        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new member
app.post('/api/members', (req, res) => {
    const { 
        name, email, join_date, address, address2, send_dm, is_living, department, annual_fee_status, is_cooperator, cert_issued,
        kananame, gender, postal, phone, district, delivery, quit_date, dob, remarks, hope, emergency_name, emergency_zip, emergency_address, emergency_phone
    } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const insert = db.prepare(`
            INSERT INTO members (
                name, email, join_date, address, address2, send_dm, is_living, department, annual_fee_status, is_cooperator, cert_issued,
                kananame, gender, postal, phone, district, delivery, quit_date, dob, remarks, hope, emergency_name, emergency_zip, emergency_address, emergency_phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const dbEmail = email || null;
        const dbJoinDate = join_date || null;
        const dbAddress = address || null;
        const dbAddress2 = address2 || null;
        const dbSendDm = send_dm === undefined ? 1 : (send_dm ? 1 : 0);
        const dbIsLiving = is_living === undefined ? 1 : (is_living ? 1 : 0);
        const dbDept = department || null;
        const dbFee = annual_fee_status || 'unpaid';
        const dbCoop = is_cooperator ? 1 : 0;
        const dbCert = cert_issued ? 1 : 0;
        const dbKananame = kananame || null;
        const dbGender = gender || null;
        const dbPostal = postal || null;
        const dbPhone = phone || null;
        const dbDistrict = district || null;
        const dbDelivery = delivery || null;
        const dbQuitDate = quit_date || null;
        const dbDob = dob || null;
        const dbRemarks = remarks || null;
        const dbHope = hope || null;
        const dbEmergName = emergency_name || null;
        const dbEmergZip = emergency_zip || null;
        const dbEmergAddress = emergency_address || null;
        const dbEmergPhone = emergency_phone || null;

        const info = insert.run(
            name, dbEmail, dbJoinDate, dbAddress, dbAddress2, dbSendDm, dbIsLiving, dbDept, dbFee, dbCoop, dbCert,
            dbKananame, dbGender, dbPostal, dbPhone, dbDistrict, dbDelivery, dbQuitDate, dbDob, dbRemarks, dbHope, dbEmergName, dbEmergZip, dbEmergAddress, dbEmergPhone
        );
        res.status(201).json({ 
            id: info.lastInsertRowid, name, email: dbEmail, join_date: dbJoinDate, address: dbAddress, address2: dbAddress2, send_dm: dbSendDm, is_living: dbIsLiving, department: dbDept, annual_fee_status: dbFee, is_cooperator: dbCoop, cert_issued: dbCert,
            kananame: dbKananame, gender: dbGender, postal: dbPostal, phone: dbPhone, district: dbDistrict, delivery: dbDelivery, quit_date: dbQuitDate, dob: dbDob, remarks: dbRemarks, hope: dbHope, emergency_name: dbEmergName, emergency_zip: dbEmergZip, emergency_address: dbEmergAddress, emergency_phone: dbEmergPhone,
            status: 'active' 
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'A member with this email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Update an existing member
app.put('/api/members/:id', (req, res) => {
    const { 
        name, email, join_date, address, address2, send_dm, is_living, status, department, annual_fee_status, is_cooperator, cert_issued,
        kananame, gender, postal, phone, district, delivery, quit_date, dob, remarks, hope, emergency_name, emergency_zip, emergency_address, emergency_phone
    } = req.body;
    const memberId = req.params.id;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const update = db.prepare(`
            UPDATE members 
            SET name = ?, email = ?, join_date = ?, address = ?, address2 = ?, send_dm = ?, is_living = ?, status = ?, department = ?, annual_fee_status = ?, is_cooperator = ?, cert_issued = ?,
                kananame = ?, gender = ?, postal = ?, phone = ?, district = ?, delivery = ?, quit_date = ?, dob = ?, remarks = ?, hope = ?, emergency_name = ?, emergency_zip = ?, emergency_address = ?, emergency_phone = ?
            WHERE id = ?
        `);

        const dbEmail = email || null;
        const dbJoinDate = join_date || null;
        const dbAddress = address || null;
        const dbAddress2 = address2 || null;
        const dbSendDm = send_dm ? 1 : 0;
        const dbIsLiving = is_living ? 1 : 0;
        const dbStatus = status || 'active';
        const dbDept = department || null;
        const dbFee = annual_fee_status || 'unpaid';
        const dbCoop = is_cooperator ? 1 : 0;
        const dbCert = cert_issued ? 1 : 0;
        const dbKananame = kananame || null;
        const dbGender = gender || null;
        const dbPostal = postal || null;
        const dbPhone = phone || null;
        const dbDistrict = district || null;
        const dbDelivery = delivery || null;
        const dbQuitDate = quit_date || null;
        const dbDob = dob || null;
        const dbRemarks = remarks || null;
        const dbHope = hope || null;
        const dbEmergName = emergency_name || null;
        const dbEmergZip = emergency_zip || null;
        const dbEmergAddress = emergency_address || null;
        const dbEmergPhone = emergency_phone || null;

        const info = update.run(
            name, dbEmail, dbJoinDate, dbAddress, dbAddress2, dbSendDm, dbIsLiving, dbStatus, dbDept, dbFee, dbCoop, dbCert,
            dbKananame, dbGender, dbPostal, dbPhone, dbDistrict, dbDelivery, dbQuitDate, dbDob, dbRemarks, dbHope, dbEmergName, dbEmergZip, dbEmergAddress, dbEmergPhone,
            memberId
        );

        if (info.changes === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ 
            id: memberId, name, email: dbEmail, join_date: dbJoinDate, address: dbAddress, address2: dbAddress2, send_dm: dbSendDm, is_living: dbIsLiving, status: dbStatus, department: dbDept, annual_fee_status: dbFee, is_cooperator: dbCoop, cert_issued: dbCert,
            kananame: dbKananame, gender: dbGender, postal: dbPostal, phone: dbPhone, district: dbDistrict, delivery: dbDelivery, quit_date: dbQuitDate, dob: dbDob, remarks: dbRemarks, hope: dbHope, emergency_name: dbEmergName, emergency_zip: dbEmergZip, emergency_address: dbEmergAddress, emergency_phone: dbEmergPhone
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'A member with this email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// --- Capital Contributions API ---

// Get all contributions, including member details
app.get('/api/contributions', (req, res) => {
    try {
        const query = `
      SELECT c.*, m.name as member_name 
      FROM capital_contributions c
      JOIN members m ON c.member_id = m.id
      ORDER BY c.pay_date DESC
    `;
        const contributions = db.prepare(query).all();
        res.json(contributions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get contributions for a specific member
app.get('/api/members/:id/contributions', (req, res) => {
    try {
        const contributions = db.prepare('SELECT * FROM capital_contributions WHERE member_id = ? ORDER BY pay_date DESC').all(req.params.id);
        res.json(contributions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Record a new capital contribution
app.post('/api/contributions', (req, res) => {
    const { member_id, amount, pay_date, notes } = req.body;

    if (!member_id || !amount || !pay_date) {
        return res.status(400).json({ error: 'Member ID, amount, and pay date are required' });
    }

    try {
        // Verify member exists
        const member = db.prepare('SELECT id FROM members WHERE id = ?').get(member_id);
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const insert = db.prepare('INSERT INTO capital_contributions (member_id, amount, pay_date, notes) VALUES (?, ?, ?, ?)');
        const info = insert.run(member_id, amount, pay_date, notes || null);
        res.status(201).json({ id: info.lastInsertRowid, member_id, amount, pay_date, notes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Dashboard Stats API ---
app.get('/api/stats', (req, res) => {
    try {
        const memberCount = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'").get().count;
        const totalCapital = db.prepare("SELECT SUM(amount) as total FROM capital_contributions").get().total || 0;

        res.json({
            activeMembers: memberCount,
            totalCapital: totalCapital
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend API serving on http://localhost:${port}`);
});
