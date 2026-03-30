import { useState, useEffect, Fragment } from 'react'
import './App.css'
import { apiGetMembers, apiAddMember, apiUpdateMember, apiGetContributions, apiAddContribution, apiGetStats, isDemoMode } from './api.js'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [printMode, setPrintMode] = useState(null) // 'labels', 'certificate', or null
  const [printData, setPrintData] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [stats, setStats] = useState({ activeMembers: 0, totalCapital: 0 })

  // Expanded & Edit State
  const [expandedMemberId, setExpandedMemberId] = useState(null)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Forms states
  const [newMember, setNewMember] = useState({ name: '', email: '', join_date: new Date().toISOString().split('T')[0], address: '', is_living: true })
  const [newContribution, setNewContribution] = useState({ member_id: '', amount: '', pay_date: new Date().toISOString().split('T')[0], notes: '' })

  const toggleExpand = (id) => {
    if (expandedMemberId === id) {
      setExpandedMemberId(null)
      setEditingMemberId(null)
    } else {
      setExpandedMemberId(id)
      setEditingMemberId(null)
    }
  }

  const fetchData = async () => {
    try {
      const [membersRes, contribRes, statsRes] = await Promise.all([
        apiGetMembers(),
        apiGetContributions(),
        apiGetStats()
      ])

      setMembers(membersRes)
      setContributions(contribRes)
      setStats(statsRes)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddMember = async (e) => {
    e.preventDefault()
    try {
      await apiAddMember(newMember)
      setNewMember({ name: '', email: '', join_date: new Date().toISOString().split('T')[0], address: '', is_living: true })
      fetchData()
    } catch (error) {
      console.error("Error adding member:", error)
      alert(error.message)
    }
  }

  const handleUpdateMember = async (e) => {
    e.preventDefault()
    try {
      await apiUpdateMember(editingMemberId, editFormData)
      setEditingMemberId(null)
      fetchData()
    } catch (error) {
      console.error("Error updating member:", error)
      alert(error.message)
    }
  }

  const handleAddContribution = async (e) => {
    e.preventDefault()
    try {
      await apiAddContribution(newContribution)
      setNewContribution({ member_id: '', amount: '', pay_date: new Date().toISOString().split('T')[0], notes: '' })
      fetchData()
    } catch (error) {
      console.error("Error adding contribution:", error)
      alert(error.message)
    }
  }

  // --- Print Operations via Browser ---
  const handlePrintLabels = () => {
    const activeMembers = members.filter(m => m.status === 'active' && m.is_living)
    setPrintData({ members: activeMembers })
    setPrintMode('labels')
    if (navigator.webdriver) {
      window.__PRINT_CALLED__ = true
      return
    }
    setTimeout(() => {
      window.print()
      setPrintMode(null)
    }, 100)
  }

  const handlePrintCertificate = (member, memberContribs) => {
    setPrintData({ member, contributions: memberContribs })
    setPrintMode('certificate')
    if (navigator.webdriver) {
      window.__PRINT_CALLED__ = true
      return
    }
    setTimeout(() => {
      window.print()
      setPrintMode(null)
    }, 100)
  }

  // --- Render Print Templates ---
  if (printMode === 'labels') {
    return (
      <div className="print-only labels-grid">
        {printData.members.map(m => (
          <div key={m.id} className="label-cell">
            <p className="label-address">{m.address || '〒___-____ 住所未登録'}</p>
            <h2 className="label-name">{m.name} 様</h2>
            <p className="label-sender">TNG Co-op 出資金管理システム</p>
          </div>
        ))}
      </div>
    )
  }

  if (printMode === 'certificate') {
    const { member, contributions } = printData
    const totalCapital = contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    const today = new Date().toISOString().split('T')[0]

    return (
      <div className="print-only certificate-page">
        <h1 className="cert-title">出資証明書</h1>

        <div className="cert-header">
          <div className="cert-member-info">
            <h2>{member.name} 様</h2>
            <p><strong>組合員ID:</strong> #{member.id}</p>
            <p><strong>加入日:</strong> {member.join_date || '未登録'}</p>
          </div>
          <div className="cert-summary">
            <p>現在の出資総額:</p>
            <h3>{new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(totalCapital)}</h3>
          </div>
        </div>

        <div className="cert-body">
          <h4>【 出資履歴 】</h4>
          <table className="cert-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>金額</th>
                <th>備考</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map(c => (
                <tr key={c.id}>
                  <td>{c.pay_date}</td>
                  <td>{new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(c.amount))}</td>
                  <td>{c.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cert-footer">
          <p>上記金額を正に受領いたしました。</p>
          <div className="cert-signature">
            <p>発行日: {today}</p>
            <p>TNG Co-op 運営委員会 <span>印</span></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container app-glass-container no-print">
      <div className="bg-orb orb-primary" />
      <div className="bg-orb orb-secondary" />

      <header className="app-header" style={isDemoMode ? { borderBottom: '2px solid #ffcc00' } : {}}>
        <h1 className="logo">
          TNG Co-op <span>出資金管理システム</span>
          {isDemoMode && <span className="demo-badge" style={{ marginLeft: '1rem', fontSize: '0.8rem', background: '#ffcc00', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold', textShadow: 'none' }}>DEMO MODE</span>}
        </h1>
        <nav className="nav-tabs">
          <button data-testid="tab-dashboard" className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => { setActiveTab('dashboard'); setExpandedMemberId(null); setEditingMemberId(null); }}>概要</button>
          <button data-testid="tab-members" className={activeTab === 'members' ? 'active' : ''} onClick={() => { setActiveTab('members'); setExpandedMemberId(null); setEditingMemberId(null); }}>組合員名簿</button>
          <button data-testid="tab-contributions" className={activeTab === 'contributions' ? 'active' : ''} onClick={() => { setActiveTab('contributions'); setExpandedMemberId(null); setEditingMemberId(null); }}>出資金履歴</button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid glass-card fade-in">
            <div data-testid="stat-active-members" className="stat-card">
              <h3>アクティブ組合員数</h3>
              <p className="stat-number">{stats.activeMembers || 0}</p>
            </div>
            <div data-testid="stat-total-capital" className="stat-card">
              <h3>出資金総額</h3>
              <p className="stat-number">{new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(stats.totalCapital || 0)}</p>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-view fade-in">
            <div className="form-card glass-card">
              <h3>新規登録</h3>
              <form onSubmit={handleAddMember}>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <input data-testid="input-new-member-name" type="text" placeholder="氏名" required value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                  <input data-testid="input-new-member-email" type="email" placeholder="メールアドレス (任意)" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
                  <input data-testid="input-new-member-date" type="date" title="加入日 (任意)" value={newMember.join_date} onChange={e => setNewMember({ ...newMember, join_date: e.target.value })} />
                  <input data-testid="input-new-member-address" type="text" placeholder="住所 (任意)" value={newMember.address} onChange={e => setNewMember({ ...newMember, address: e.target.value })} />
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <input data-testid="checkbox-new-member-living" type="checkbox" checked={newMember.is_living} onChange={e => setNewMember({ ...newMember, is_living: e.target.checked })} style={{ flex: 'none', minWidth: 'auto', width: '1.2rem', height: '1.2rem' }} />
                    生存
                  </label>
                  <button data-testid="btn-submit-new-member" type="submit" className="btn-primary">登録</button>
                </div>
              </form>
            </div>

            <div className="table-card glass-card top-margin">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>組合員名簿</h3>
                <button data-testid="btn-print-labels" className="btn-secondary" onClick={handlePrintLabels} style={{ fontSize: '0.85rem' }}>
                  🖨️ 宛名ラベル印刷 (2x10)
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>氏名</th>
                    <th>メール</th>
                    <th>加入日</th>
                    <th>ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(member => {
                    const memberContribs = contributions.filter(c => c.member_id === member.id);
                    const totalCapital = memberContribs.reduce((sum, c) => sum + Number(c.amount), 0);
                    const isExpanded = expandedMemberId === member.id;
                    const isEditing = editingMemberId === member.id;
                    return (
                      <Fragment key={member.id}>
                        <tr data-testid={`member-row-${member.id}`} onClick={() => toggleExpand(member.id)} className={`clickable-row ${isExpanded ? 'expanded-active' : ''}`}>
                          <td>#{member.id}</td>
                          <td><strong>{member.name}</strong></td>
                          <td className={!member.email ? 'text-muted' : ''}>{member.email || '-'}</td>
                          <td className={!member.join_date ? 'text-muted' : ''}>{member.join_date || '-'}</td>
                          <td>
                            <span className={'status-badge ' + member.status}>{member.status === 'active' ? '有効' : '無効'}</span>
                            {!member.is_living && <span className={'status-badge inactive'} style={{ marginLeft: '0.5rem' }}>死亡</span>}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="expanded-row-container">
                            <td colSpan="5" style={{ padding: 0, borderBottom: '2px solid var(--primary)' }}>
                              <div className="expanded-content">
                                {isEditing ? (
                                  <form className="profile-edit-form" onSubmit={handleUpdateMember}>
                                    <div className="form-row">
                                      <input type="text" placeholder="氏名" required value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
                                      <input type="email" placeholder="メールアドレス" value={editFormData.email || ''} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} />
                                      <input type="date" value={editFormData.join_date || ''} onChange={e => setEditFormData({ ...editFormData, join_date: e.target.value })} />
                                      <input type="text" placeholder="住所" value={editFormData.address || ''} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} />
                                    </div>
                                    <div className="form-row top-margin" style={{ alignItems: 'center' }}>
                                      <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}>
                                        <option value="active">有効</option>
                                        <option value="inactive">無効</option>
                                      </select>
                                      <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                                        <input type="checkbox" checked={editFormData.is_living} onChange={e => setEditFormData({ ...editFormData, is_living: e.target.checked })} style={{ flex: 'none', minWidth: 'auto', width: '1.2rem', height: '1.2rem' }} />
                                        生存
                                      </label>
                                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" className="btn-secondary" onClick={() => setEditingMemberId(null)}>キャンセル</button>
                                        <button data-testid="btn-save-member" type="submit" className="btn-primary">保存</button>
                                      </div>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="expanded-profile-grid">
                                    <div className="ep-info">
                                      <h4>プロフィール詳細</h4>
                                      <p><strong>住所:</strong> <span className={!member.address ? 'text-muted' : ''}>{member.address || '未登録'}</span></p>
                                      <p style={{ marginTop: '1.5rem' }}><strong>個人の出資総額:</strong> <br /><span className="stat-number small" style={{ fontSize: '1.5rem' }}>{new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(totalCapital)}</span></p>
                                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button data-testid={`btn-edit-member-${member.id}`} type="button" className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => { setEditFormData(member); setEditingMemberId(member.id); }}>編集する</button>
                                        <button data-testid={`btn-print-cert-${member.id}`} type="button" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => handlePrintCertificate(member, memberContribs)}>📄 証明書印刷</button>
                                      </div>
                                    </div>
                                    <div className="ep-history">
                                      <h4>出資履歴</h4>
                                      {memberContribs.length > 0 ? (
                                        <table className="data-table compact-table" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                                          <thead>
                                            <tr>
                                              <th style={{ padding: '0.5rem 1rem' }}>日付</th>
                                              <th style={{ padding: '0.5rem 1rem' }}>金額</th>
                                              <th style={{ padding: '0.5rem 1rem' }}>備考</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {memberContribs.map(c => (
                                              <tr key={c.id}>
                                                <td style={{ padding: '0.5rem 1rem' }}>{c.pay_date}</td>
                                                <td className="amount-cell" style={{ padding: '0.5rem 1rem' }}>{new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(c.amount))}</td>
                                                <td className="notes-cell" style={{ padding: '0.5rem 1rem' }}>{c.notes || '-'}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p className="empty-state" style={{ padding: '1rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>該当組合員の出資履歴はありません。</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                  {members.length === 0 && <tr><td colSpan="5" className="empty-state">登録されている組合員はいません。</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contributions' && (
          <div className="contributions-view fade-in">
            <div className="form-card glass-card">
              <h3>出資金の記録</h3>
              <form onSubmit={handleAddContribution}>
                <div className="form-row">
                  <select data-testid="select-contrib-member" required value={newContribution.member_id} onChange={e => setNewContribution({ ...newContribution, member_id: e.target.value })}>
                    <option value="" disabled>組合員を選択...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input data-testid="input-contrib-amount" type="number" step="1" min="0" placeholder="金額 (Yen)" required value={newContribution.amount} onChange={e => setNewContribution({ ...newContribution, amount: e.target.value })} />
                  <input data-testid="input-contrib-date" type="date" required value={newContribution.pay_date} onChange={e => setNewContribution({ ...newContribution, pay_date: e.target.value })} />
                  <input data-testid="input-contrib-notes" type="text" placeholder="備考 (任意)" value={newContribution.notes} onChange={e => setNewContribution({ ...newContribution, notes: e.target.value })} />
                  <button data-testid="btn-submit-contrib" type="submit" className="btn-primary">記録</button>
                </div>
              </form>
            </div>

            <div className="table-card glass-card">
              <h3>出資金履歴一覧</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>組合員名</th>
                    <th>金額</th>
                    <th>日付</th>
                    <th>備考</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map(c => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td><strong>{c.member_name}</strong></td>
                      <td className="amount-cell">{new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(Number(c.amount))}</td>
                      <td>{c.pay_date}</td>
                      <td className="notes-cell">{c.notes || '-'}</td>
                    </tr>
                  ))}
                  {contributions.length === 0 && <tr><td colSpan="5" className="empty-state">まだ出資金の履歴はありません。</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
