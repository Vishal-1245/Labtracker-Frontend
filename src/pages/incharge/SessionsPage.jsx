import React, { useState, useEffect } from 'react';
import { getLabs } from '../../api/labApi';
import { getExperiments } from '../../api/experimentApi';
import { getUsers } from '../../api/userApi';
import {
  getSessions,
  createSession,
  updateSessionStatus,
  getAttendance,
  submitAttendance,
  getTeams,
  createTeam,
} from '../../api/sessionApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import FormInput from '../../components/common/FormInput';

// Faculty practical session execution: scheduling, opening/closing sessions, taking attendance, and workbench team formation
const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [selectedLab, setSelectedLab] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Schedule Session Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [sessionFormData, setSessionFormData] = useState({
    labId: '',
    experimentId: '',
    sessionDate: todayStr,
    startTime: '09:30',
    endTime: '12:30',
    batch: '',
    status: 'OPEN',
  });
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attendance Modal State
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Teams Modal State
  const [teamsSession, setTeamsSession] = useState(null);
  const [teamsList, setTeamsList] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessData, labsData, usersData] = await Promise.all([
        getSessions(),
        getLabs(),
        getUsers(),
      ]);
      setSessions(sessData);
      setLabs(labsData);
      setStudents(usersData.filter((u) => u.role === 'STUDENT'));

      if (labsData.length > 0) {
        setSessionFormData((prev) => ({ ...prev, labId: labsData[0].id.toString() }));
        const exps = await getExperiments(labsData[0].id);
        setExperiments(exps);
        if (exps.length > 0) {
          setSessionFormData((prev) => ({ ...prev, experimentId: exps[0].id.toString() }));
        }
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When selected lab in create modal changes, reload its experiments
  const handleLabChangeInModal = async (labId) => {
    setSessionFormData((prev) => ({ ...prev, labId }));
    try {
      const exps = await getExperiments(labId);
      setExperiments(exps);
      setSessionFormData((prev) => ({
        ...prev,
        experimentId: exps.length > 0 ? exps[0].id.toString() : '',
      }));
    } catch (err) {
      console.error('Failed to load experiments for lab:', err);
    }
  };

  // Schedule session submit
  const handleCreateSessionSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!sessionFormData.labId || !sessionFormData.experimentId || !sessionFormData.batch.trim()) {
      setModalError('Laboratory, Experiment, and Batch name are required.');
      return;
    }

    if (sessionFormData.startTime >= sessionFormData.endTime) {
      setModalError('Start time must be earlier than end time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        labId: parseInt(sessionFormData.labId, 10),
        experimentId: parseInt(sessionFormData.experimentId, 10),
        sessionDate: sessionFormData.sessionDate,
        startTime: `${sessionFormData.startTime}:00`,
        endTime: `${sessionFormData.endTime}:00`,
        batch: sessionFormData.batch.trim(),
        status: sessionFormData.status,
      };

      await createSession(payload);
      setActionSuccess(`Practical session scheduled for batch '${payload.batch}'.`);
      setIsCreateModalOpen(false);
      const updated = await getSessions();
      setSessions(updated);
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle session OPEN / CLOSED
  const handleToggleStatus = async (session) => {
    const nextStatus = session.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateSessionStatus(session.id, nextStatus);
      setActionSuccess(`Session #${session.id} (${session.batch}) marked as ${nextStatus}.`);
      const updated = await getSessions();
      setSessions(updated);
    } catch (err) {
      setError(err);
    }
  };

  // Open Attendance Modal
  const handleOpenAttendance = async (session) => {
    setAttendanceSession(session);
    setLoadingAttendance(true);
    try {
      const recorded = await getAttendance(session.id);
      // Map existing or build for all students
      const initialMap = {};
      recorded.forEach((r) => {
        initialMap[r.studentId] = r.present;
      });

      const records = students.map((stu) => ({
        studentId: stu.id,
        rollNo: stu.username,
        name: stu.fullName,
        present: initialMap[stu.id] !== undefined ? initialMap[stu.id] : true,
      }));

      setAttendanceRecords(records);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Toggle individual student attendance
  const handleToggleStudentPresence = (studentId) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, present: !r.present } : r))
    );
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!attendanceSession) return;
    setIsSavingAttendance(true);
    try {
      const payload = attendanceRecords.map((r) => ({
        studentId: r.studentId,
        present: r.present,
      }));

      await submitAttendance(attendanceSession.id, payload);
      setActionSuccess(`Attendance recorded for batch '${attendanceSession.batch}'.`);
      setAttendanceSession(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Open Teams Modal
  const handleOpenTeams = async (session) => {
    setTeamsSession(session);
    setLoadingTeams(true);
    setNewTeamName(`Workbench-${session.id}-1`);
    setSelectedMembers([]);
    try {
      const teams = await getTeams(session.id);
      setTeamsList(teams);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Create team submit
  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim() || selectedMembers.length === 0) {
      return;
    }
    setIsCreatingTeam(true);
    try {
      await createTeam(teamsSession.id, {
        teamName: newTeamName.trim(),
        memberIds: selectedMembers,
      });
      const updatedTeams = await getTeams(teamsSession.id);
      setTeamsList(updatedTeams);
      setNewTeamName('');
      setSelectedMembers([]);
      setActionSuccess('Workbench team registered.');
    } catch (err) {
      setError(err);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesLab = selectedLab === 'ALL' || s.labId?.toString() === selectedLab;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesLab && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Practical Class Sessions</h1>
          <p className="page-subtitle">
            Schedule lab hours, monitor active batches, mark attendance, and manage student teams
          </p>
        </div>
        <button onClick={() => { setModalError(null); setIsCreateModalOpen(true); }} className="btn btn-primary btn-sm">
          + Schedule Lab Session
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          ✓ {actionSuccess}
          <button
            onClick={() => setActionSuccess('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '240px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Filter by Lab</label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="form-control"
            >
              <option value="ALL">All Laboratories</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '180px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Session Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-control"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN (Active)</option>
              <option value="CLOSED">CLOSED (Completed)</option>
            </select>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'flex-end', paddingBottom: '8px' }}>
            Total <strong>{filteredSessions.length}</strong> practical sessions
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      {loading ? (
        <Loader message="Loading practical sessions..." />
      ) : filteredSessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏫</div>
          <div className="empty-title">No Sessions Scheduled</div>
          <p className="empty-text">
            No laboratory class sessions found for the current selection.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Laboratory</th>
                  <th>Experiment</th>
                  <th>Session Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.batch}</strong></td>
                    <td>{s.sessionDate}</td>
                    <td>
                      <code>
                        {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
                      </code>
                    </td>
                    <td>{s.labName}</td>
                    <td>{s.experimentCode || s.experimentTitle || 'Practical Session'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            borderColor: s.status === 'OPEN' ? 'var(--warning-color)' : 'var(--success-color)',
                            color: s.status === 'OPEN' ? 'var(--warning-color)' : 'var(--success-color)',
                          }}
                        >
                          {s.status === 'OPEN' ? 'Close' : 'Open'}
                        </button>
                        <button
                          onClick={() => handleOpenAttendance(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => handleOpenTeams(s)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Teams
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Practical Session</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleCreateSessionSubmit}>
              <div className="modal-body">
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

                <FormInput
                  label="Batch Name"
                  name="batch"
                  value={sessionFormData.batch}
                  onChange={(e) => setSessionFormData({ ...sessionFormData, batch: e.target.value })}
                  placeholder="e.g. ECE-2B-Batch-A"
                  required
                />

                <div className="form-group">
                  <label className="form-label">Laboratory Room <span className="required">*</span></label>
                  <select
                    value={sessionFormData.labId}
                    onChange={(e) => handleLabChangeInModal(e.target.value)}
                    className="form-control"
                    required
                  >
                    {labs.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.roomNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Curriculum Experiment <span className="required">*</span></label>
                  <select
                    value={sessionFormData.experimentId}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, experimentId: e.target.value })}
                    className="form-control"
                    required
                  >
                    {experiments.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        [{exp.code}] {exp.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                  <FormInput
                    label="Date"
                    name="sessionDate"
                    type="date"
                    value={sessionFormData.sessionDate}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, sessionDate: e.target.value })}
                    required
                  />

                  <FormInput
                    label="Start Time"
                    name="startTime"
                    type="time"
                    value={sessionFormData.startTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, startTime: e.target.value })}
                    required
                  />

                  <FormInput
                    label="End Time"
                    name="endTime"
                    type="time"
                    value={sessionFormData.endTime}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {isSubmitting ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceSession && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Attendance: {attendanceSession.batch} ({attendanceSession.sessionDate})</h3>
              <button onClick={() => setAttendanceSession(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {loadingAttendance ? (
                <Loader message="Loading student list..." />
              ) : attendanceRecords.length === 0 ? (
                <p>No registered students available for attendance.</p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th style={{ textAlign: 'center' }}>Present</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((r) => (
                        <tr key={r.studentId}>
                          <td><code>{r.rollNo}</code></td>
                          <td><strong>{r.name}</strong></td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={r.present}
                              onChange={() => handleToggleStudentPresence(r.studentId)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setAttendanceSession(null)}
                className="btn btn-secondary btn-sm"
                disabled={isSavingAttendance}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isSavingAttendance}
                className="btn btn-primary btn-sm"
              >
                {isSavingAttendance ? 'Saving...' : 'Submit Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams Formation Modal */}
      {teamsSession && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Workbench Teams: {teamsSession.batch}</h3>
              <button onClick={() => setTeamsSession(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {/* Form to create a new team */}
              <form onSubmit={handleCreateTeamSubmit} className="card" style={{ padding: '12px', background: 'var(--bg-primary)', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Form New Workbench Team</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Team Name (e.g. Bench-1)"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="form-control"
                    required
                  />

                  <select
                    multiple
                    value={selectedMembers.map(String)}
                    onChange={(e) => {
                      const vals = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value, 10));
                      setSelectedMembers(vals);
                    }}
                    className="form-control"
                    style={{ height: '70px' }}
                  >
                    {students.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.username} - {stu.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Hold Ctrl / Cmd to select multiple student members.
                  </span>
                  <button
                    type="submit"
                    disabled={isCreatingTeam || !newTeamName.trim() || selectedMembers.length === 0}
                    className="btn btn-primary btn-sm"
                  >
                    {isCreatingTeam ? 'Forming...' : '+ Create Team'}
                  </button>
                </div>
              </form>

              {/* Existing Teams List */}
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Registered Teams ({teamsList.length})</h4>
              {loadingTeams ? (
                <Loader message="Loading teams..." />
              ) : teamsList.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No teams formed for this session yet.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {teamsList.map((t) => (
                    <div key={t.id} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      <strong>{t.teamName}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Members: {t.members?.map((m) => `${m.fullName} (${m.username})`).join(', ') || 'None'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setTeamsSession(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
