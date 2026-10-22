import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Inbox,
  LockKeyhole,
  LayoutDashboard,
  LogOut,
  Mail,
  MoveUpRight,
  Pencil,
  Plus,
  Search,
  Settings2,
  Shapes,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
const API_DOCS_URL = API_BASE_URL.endsWith('/api/v1')
  ? `${API_BASE_URL.slice(0, -7)}/api/docs`
  : `${API_BASE_URL}/docs`;

function getPublicFormUrl(slug) {
  const apiOrigin = API_BASE_URL.endsWith('/api/v1')
    ? API_BASE_URL.slice(0, -7)
    : API_BASE_URL;
  return `${apiOrigin || window.location.origin}/f/${encodeURIComponent(slug)}`;
}

let sessionRestorePromise;
let accessTokenRefreshPromise;
let activeAccessToken = '';

async function refreshAccessToken() {
  if (!accessTokenRefreshPromise) {
    accessTokenRefreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.status === 401 || response.status === 403) return null;
      if (!response.ok) throw new Error('Unable to refresh your session. Please sign in again.');

      const result = await response.json();
      const token = result.data?.accessToken;
      if (!token) throw new Error('The server returned an invalid session response.');
      activeAccessToken = token;
      return token;
    })().finally(() => {
      accessTokenRefreshPromise = undefined;
    });
  }
  return accessTokenRefreshPromise;
}

async function apiRequest(path, token, options = {}, hasRetried = false) {
  const requestToken = activeAccessToken || token;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}),
      ...options.headers,
    },
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response. Please try again.');
  }

  if (!response.ok) {
    if (response.status === 401 && requestToken && !hasRetried && path !== '/auth/logout') {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) return apiRequest(path, refreshedToken, options, true);
    }
    const validationMessage = Array.isArray(result.details)
      ? result.details.map((detail) => detail?.message).filter(Boolean).join(' ')
      : '';
    throw new Error(validationMessage || result.error || result.message || 'The request failed. Please try again.');
  }

  return result;
}

function restoreSession() {
  if (!sessionRestorePromise) {
    sessionRestorePromise = (async () => {
      const token = await refreshAccessToken();
      if (!token) return null;
      const userResponse = await apiRequest('/users/me', token);
      if (!userResponse.data?.id) throw new Error('The server returned an invalid user response.');
      return { token, user: userResponse.data };
    })().finally(() => {
      sessionRestorePromise = undefined;
    });
  }
  return sessionRestorePromise;
}

function BrandMark({ light = false }) {
  return (
    <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="FormSlug home">
      <span className="brand-mark" aria-hidden="true">
        <Shapes size={19} strokeWidth={2.2} />
      </span>
      <span>formslug</span>
    </a>
  );
}

function Field({ id, label, type = 'text', value, onChange, placeholder, icon: Icon, autoComplete, trailing, disabled }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <Icon className="input-icon" size={18} strokeWidth={1.8} aria-hidden="true" />
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        {trailing}
      </span>
    </label>
  );
}

function WordmarkIllustration() {
  return (
    <div className="illustration" aria-hidden="true">
      <div className="illustration-glow" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="floating-dot dot-one" />
      <div className="floating-dot dot-two" />
      <div className="floating-dot dot-three" />
      <div className="form-card">
        <div className="form-card-top">
          <span className="mini-mark"><Shapes size={14} /></span>
          <span className="form-card-label">NEW RESPONSE</span>
          <span className="response-dot" />
        </div>
        <div className="form-card-title">A little about you</div>
        <div className="mock-field">
          <span>Your name</span>
          <span className="mock-line" />
        </div>
        <div className="mock-field">
          <span>Email address</span>
          <span className="mock-line short-line" />
        </div>
        <div className="mock-field message-field">
          <span>What’s on your mind?</span>
          <span className="mock-line" />
          <span className="mock-line medium-line" />
        </div>
        <div className="mock-submit">Send response <ArrowRight size={14} /></div>
      </div>
      <div className="response-toast">
        <span className="toast-check"><Check size={14} strokeWidth={3} /></span>
        <span><strong>Response received</strong><small>Just now · safely delivered</small></span>
        <Sparkles className="toast-sparkle" size={17} />
      </div>
      <span className="illustration-caption">Good forms. Better conversations.</span>
    </div>
  );
}

const initialForms = [
  { id: 1, name: 'Customer feedback', responses: 128, updated: '2 hours ago', status: 'Active', color: 'sage' },
  { id: 2, name: 'Contact form', responses: 64, updated: 'Yesterday', status: 'Active', color: 'peach' },
  { id: 3, name: 'Product waitlist', responses: 32, updated: '2 days ago', status: 'Draft', color: 'lavender' },
];

function FormBuilder({ onBack, onSaved, accessToken, project, isPreview = false }) {
  const [savedProject, setSavedProject] = useState(project);
  const [title, setTitle] = useState('Untitled form');
  const [description, setDescription] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [fields, setFields] = useState([
    { id: 1, label: 'Your name', type: 'text', placeholder: 'Enter your answer', required: true },
  ]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateField(id, updates) {
    setFields((currentFields) => currentFields.map((field) => (
      field.id === id ? { ...field, ...updates } : field
    )));
  }

  async function saveForm(event) {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Give your form a title before saving.');
      return;
    }
    if (!fields.length || fields.some((field) => !field.label.trim())) {
      setError('Add a label to each question before saving.');
      return;
    }

    if (isPreview) {
      onSaved({
        id: `preview-${Date.now()}`,
        name: title.trim(),
        responses: 0,
        updated: 'Just now',
        status: 'Draft',
        color: 'sage',
      });
      return;
    }

    setIsSaving(true);
    try {
      let targetProject = savedProject;
      if (!targetProject) {
        const projectResponse = await apiRequest('/projects', accessToken, {
          method: 'POST',
          body: JSON.stringify({ name: 'FormSlug Studio' }),
        });
        targetProject = projectResponse.data;
        if (!targetProject?.id) throw new Error('The server returned an invalid project.');
        setSavedProject(targetProject);
      }

      const formResponse = await apiRequest(
        `/projects/${encodeURIComponent(targetProject.id)}/forms`,
        accessToken,
        {
          method: 'POST',
          body: JSON.stringify({
            name: title.trim(),
            ...(notificationEmail.trim() ? { notification_email: notificationEmail.trim() } : {}),
            config: {
              description: description.trim(),
              fields: fields.map(({ id, label, type, placeholder, required }) => ({
                id,
                label: label.trim(),
                type,
                placeholder: placeholder.trim(),
                required,
              })),
            },
          }),
        },
      );
      if (!formResponse.data?.id) throw new Error('The server returned an invalid form.');
      onSaved();
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Unable to reach the form service. Check your connection and try again.'
        : requestError.message || 'Unable to save your form.');
    } finally {
      setIsSaving(false);
    }
  }

  function addField() {
    setFields((currentFields) => [...currentFields, {
      id: Date.now(),
      label: '',
      type: 'text',
      placeholder: 'Enter your answer',
      required: false,
    }]);
  }

  return (
    <main className="builder-shell">
      <header className="builder-topbar">
        <button className="builder-back" type="button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to workspace
        </button>
        <div className="builder-save-state"><span /> {isPreview ? 'Preview mode' : 'Unsaved changes'}</div>
        <button className="builder-save-button" type="submit" form="form-builder" disabled={isSaving}>
          {isSaving ? 'Saving...' : (isPreview ? 'Save preview' : 'Save form')}
          {!isSaving && <ArrowRight size={15} />}
        </button>
      </header>

      <div className="builder-content">
        <div className="builder-heading">
          <div className="dashboard-eyebrow">FORM BUILDER</div>
          <h1>Build your form</h1>
          <p>Shape the questions and preview what people will see.</p>
        </div>

        {isPreview && (
          <div className="builder-preview-note" role="status">
            Preview mode: this form is only saved in this browser preview.
          </div>
        )}
        {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}

        <form id="form-builder" className="builder-layout" onSubmit={saveForm}>
          <section className="builder-editor" aria-label="Edit form">
            <div className="builder-card">
              <label className="builder-label" htmlFor="builder-title">Form title</label>
              <input
                id="builder-title"
                className="builder-title-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Untitled form"
                required
              />
              <label className="builder-label" htmlFor="builder-description">Description <span>Optional</span></label>
              <textarea
                id="builder-description"
                className="builder-description-input"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                placeholder="Tell people what this form is about"
                rows={3}
              />
              <label className="builder-label" htmlFor="builder-notification-email">
                Response notifications <span>Optional</span>
              </label>
              <input
                id="builder-notification-email"
                className="builder-question-input"
                type="email"
                value={notificationEmail}
                onChange={(event) => setNotificationEmail(event.target.value)}
                maxLength={254}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="builder-fields-heading">
              <div><h2>Questions</h2><p>Add the details you want to collect.</p></div>
              <span>{fields.length} {fields.length === 1 ? 'question' : 'questions'}</span>
            </div>

            <div className="builder-field-list">
              {fields.map((field, index) => (
                <article className="builder-field-card" key={field.id}>
                  <div className="builder-field-top">
                    <span className="builder-field-number"><GripVertical size={14} /> {String(index + 1).padStart(2, '0')}</span>
                    <label className="builder-type-select">
                      <span className="sr-only">Question type</span>
                      <select
                        aria-label={`Question ${index + 1} type`}
                        value={field.type}
                        onChange={(event) => updateField(field.id, { type: event.target.value })}
                      >
                        <option value="text">Short answer</option>
                        <option value="email">Email</option>
                        <option value="textarea">Long answer</option>
                      </select>
                    </label>
                    <button
                      className="builder-remove-field"
                      type="button"
                      aria-label={`Remove question ${index + 1}`}
                      onClick={() => setFields((currentFields) => currentFields.filter((item) => item.id !== field.id))}
                      disabled={fields.length === 1}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <label className="builder-label" htmlFor={`field-label-${field.id}`}>Question</label>
                  <input
                    id={`field-label-${field.id}`}
                    className="builder-question-input"
                    value={field.label}
                    onChange={(event) => updateField(field.id, { label: event.target.value })}
                    maxLength={120}
                    placeholder="Write your question"
                    required
                  />
                  <label className="builder-label" htmlFor={`field-placeholder-${field.id}`}>Placeholder <span>Optional</span></label>
                  <input
                    id={`field-placeholder-${field.id}`}
                    className="builder-question-input"
                    value={field.placeholder}
                    onChange={(event) => updateField(field.id, { placeholder: event.target.value })}
                    maxLength={120}
                    placeholder="Enter your answer"
                  />
                  <label className="builder-required">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) => updateField(field.id, { required: event.target.checked })}
                    />
                    <span>Required question</span>
                  </label>
                </article>
              ))}
            </div>

            <button className="builder-add-field" type="button" onClick={addField}>
              <Plus size={16} /> Add a question
            </button>
          </section>

          <aside className="builder-preview" aria-label="Form preview">
            <div className="builder-preview-heading"><span>LIVE PREVIEW</span><Eye size={15} /></div>
            <div className="builder-preview-canvas">
              <div className="builder-preview-brand"><span><Shapes size={14} /></span> formslug</div>
              <div className="builder-preview-form">
                <span className="builder-preview-eyebrow">NEW RESPONSE</span>
                <h2>{title.trim() || 'Untitled form'}</h2>
                {description && <p className="builder-preview-description">{description}</p>}
                {fields.map((field, index) => (
                  <label className="builder-preview-question" key={field.id}>
                    <span>{field.label.trim() || `Question ${index + 1}`}{field.required && <i>*</i>}</span>
                    {field.type === 'textarea'
                      ? <textarea placeholder={field.placeholder || 'Your answer'} rows={3} disabled />
                      : <input type={field.type} placeholder={field.placeholder || 'Your answer'} disabled />}
                  </label>
                ))}
                <button className="builder-preview-submit" type="button" disabled>
                  Send response <ArrowRight size={14} />
                </button>
                <small className="builder-preview-foot"><LockKeyhole size={11} /> Your response is kept private.</small>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function ResponsesPanel({ forms, accessToken, onNotice, initialFormId }) {
  const [selectedFormId, setSelectedFormId] = useState(initialFormId || forms[0]?.id || '');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const selectedForm = forms.find((form) => form.id === selectedFormId);

  useEffect(() => {
    if (initialFormId) setSelectedFormId(initialFormId);
  }, [initialFormId]);

  useEffect(() => {
    if (!selectedForm && forms.length) setSelectedFormId(forms[0].id);
  }, [forms, selectedForm]);

  useEffect(() => {
    if (!selectedForm || !selectedForm.projectId) {
      setSubmissions([]);
      setMeta({ total: 0, totalPages: 0 });
      return undefined;
    }

    const controller = new AbortController();
    async function loadSubmissions() {
      setIsLoading(true);
      setError('');
      setSelectedSubmission(null);
      try {
        const result = await apiRequest(
          `/projects/${encodeURIComponent(selectedForm.projectId)}/forms/${encodeURIComponent(selectedForm.id)}/submissions?page=${page}&limit=20&includeDeleted=${includeDeleted}`,
          accessToken,
          { signal: controller.signal },
        );
        if (!Array.isArray(result.data) || !result.meta) {
          throw new Error('The server returned an invalid response list.');
        }
        if (!controller.signal.aborted) {
          setSubmissions(result.data);
          setMeta({
            total: Number(result.meta.total) || 0,
            totalPages: Number(result.meta.totalPages) || 0,
          });
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof TypeError
            ? 'Unable to reach the response service. Check your connection and try again.'
            : requestError.message || 'Unable to load responses.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadSubmissions();
    return () => controller.abort();
  }, [accessToken, includeDeleted, page, reloadKey, selectedForm]);

  async function updateSubmission(submission) {
    const action = submission.deleted_at ? 'restore' : 'delete';
    try {
      await apiRequest(
        `/projects/${encodeURIComponent(selectedForm.projectId)}/forms/${encodeURIComponent(selectedForm.id)}/submissions/${encodeURIComponent(submission.id)}${action === 'restore' ? '/restore' : ''}`,
        accessToken,
        { method: action === 'restore' ? 'POST' : 'DELETE' },
      );
      setSelectedSubmission(null);
      setReloadKey((key) => key + 1);
      onNotice(action === 'restore' ? 'Response restored.' : 'Response moved to trash.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this response.');
    }
  }

  async function exportSubmissions() {
    if (!selectedForm) return;
    setIsExporting(true);
    setError('');
    try {
      const exportUrl = `${API_BASE_URL}/projects/${encodeURIComponent(selectedForm.projectId)}/forms/${encodeURIComponent(selectedForm.id)}/submissions/export?includeDeleted=${includeDeleted}`;
      const requestExport = (token) => fetch(exportUrl, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      let response = await requestExport(activeAccessToken || accessToken);
      if (response.status === 401) {
        const token = await refreshAccessToken();
        if (token) response = await requestExport(token);
      }
      if (!response.ok) {
        let result = {};
        try {
          result = await response.json();
        } catch {
          throw new Error('The server returned an invalid export response.');
        }
        throw new Error(result.error || result.message || 'Unable to export responses.');
      }
      const downloadUrl = URL.createObjectURL(await response.blob());
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${selectedForm.name.trim().replace(/[^a-z0-9-_]+/gi, '-') || 'responses'}-responses.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Unable to reach the export service. Check your connection and try again.'
        : requestError.message || 'Unable to export responses.');
    } finally {
      setIsExporting(false);
    }
  }

  if (!forms.length) {
    return <div className="responses-empty">Create a form first to start collecting responses.</div>;
  }

  return (
    <section className="responses-panel" aria-label="Form responses">
      <div className="responses-toolbar">
        <div>
          <h2>Responses</h2>
          <p>Review, restore, or export submissions to your forms.</p>
        </div>
        <div className="responses-controls">
          <label className="response-form-select">
            <span className="sr-only">Choose a form</span>
            <select
              value={selectedFormId}
              onChange={(event) => {
                setSelectedFormId(event.target.value);
                setPage(1);
              }}
            >
              {forms.map((form) => <option key={form.id} value={form.id}>{form.name}</option>)}
            </select>
          </label>
          <label className="include-deleted-control">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => {
                setIncludeDeleted(event.target.checked);
                setPage(1);
              }}
            />
            Include deleted
          </label>
          <button className="export-button" type="button" onClick={exportSubmissions} disabled={!selectedForm || isExporting}>
            <Download size={15} /> {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}
      <div className="responses-table">
        <div className="responses-table-head"><span>RECEIVED</span><span>SUBMISSION</span><span>STATUS</span><span /></div>
        {isLoading && <div className="empty-forms">Loading responses...</div>}
        {!isLoading && submissions.map((submission) => (
          <article className="response-row-wrap" key={submission.id}>
            <div className="response-row">
              <span className="response-date">
                {submission.created_at
                  ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(submission.created_at))
                  : '—'}
              </span>
              <button
                className="response-preview"
                type="button"
                onClick={() => setSelectedSubmission((current) => current?.id === submission.id ? null : submission)}
              >
                {Object.entries(submission.data || {}).slice(0, 2).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || 'View submission'}
              </button>
              <span className={`form-status ${submission.deleted_at ? 'draft' : 'active'}`}>
                <i />{submission.deleted_at ? 'Deleted' : 'Received'}
              </span>
              <button
                className="response-action"
                type="button"
                onClick={() => updateSubmission(submission)}
              >
                {submission.deleted_at ? 'Restore' : 'Delete'}
              </button>
            </div>
            {selectedSubmission?.id === submission.id && (
              <div className="response-detail">
                <pre>{JSON.stringify(submission.data, null, 2)}</pre>
                <div>Submission ID: {submission.id}</div>
              </div>
            )}
          </article>
        ))}
        {!isLoading && !error && submissions.length === 0 && (
          <div className="empty-forms">No responses for this form yet.</div>
        )}
      </div>
      <div className="responses-pagination">
        <span>{meta.total} {meta.total === 1 ? 'response' : 'responses'}</span>
        <div>
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || isLoading}>
            <ArrowLeft size={14} /> Previous
          </button>
          <span>Page {page} of {Math.max(meta.totalPages, 1)}</span>
          <button type="button" onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))} disabled={page >= meta.totalPages || isLoading}>
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function AccountSettings({ accessToken, user, onUserUpdated, onLogout }) {
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function updateProfile(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const result = await apiRequest('/users/me', accessToken, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      });
      onUserUpdated(result.data);
      setNotice('Your profile has been updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update your profile.');
    } finally {
      setIsSaving(false);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      await apiRequest('/users/me/password', accessToken, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setNotice('Your password has been changed.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to change your password.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAccount() {
    setError('');
    setIsSaving(true);
    try {
      await apiRequest('/users/me', accessToken, { method: 'DELETE' });
      onLogout();
    } catch (requestError) {
      setError(requestError.message || 'Unable to schedule account deletion.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="settings-panel" aria-label="Account settings">
      <div className="settings-heading">
        <h2>Account settings</h2>
        <p>Manage your profile and sign-in details.</p>
      </div>
      {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}
      {notice && <div className="dashboard-notice" role="status">{notice}</div>}
      <form className="settings-card" onSubmit={updateProfile}>
        <div><h3>Profile</h3><p>Update the name associated with your workspace.</p></div>
        <label className="settings-field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
        </label>
        <label className="settings-field">
          <span>Email address</span>
          <input value={user?.email || ''} type="email" readOnly />
        </label>
        <button className="settings-submit" type="submit" disabled={isSaving}>Save profile</button>
      </form>
      <form className="settings-card" onSubmit={updatePassword}>
        <div><h3>Change password</h3><p>Choose a new password with at least 8 characters.</p></div>
        <label className="settings-field">
          <span>Current password</span>
          <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} minLength={8} required />
        </label>
        <label className="settings-field">
          <span>New password</span>
          <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required />
        </label>
        <button className="settings-submit" type="submit" disabled={isSaving}>Update password</button>
      </form>
      <div className="settings-card settings-danger-zone">
        <div><h3>Delete account</h3><p>Your account is scheduled for deletion with a 30-day recovery period.</p></div>
        {confirmDelete ? (
          <div className="settings-delete-confirm" role="group" aria-label="Confirm account deletion">
            <span>Schedule deletion for this account?</span>
            <button className="settings-delete" type="button" onClick={deleteAccount} disabled={isSaving}>
              {isSaving ? 'Scheduling…' : 'Confirm deletion'}
            </button>
            <button className="settings-cancel" type="button" onClick={() => setConfirmDelete(false)} disabled={isSaving}>Cancel</button>
          </div>
        ) : (
          <button className="settings-delete" type="button" onClick={() => setConfirmDelete(true)} disabled={isSaving}>Schedule deletion</button>
        )}
      </div>
    </section>
  );
}

function Dashboard({ onLogout, onUserUpdated, onCreateForm, accessToken, user, isPreview = false, previewForms = [] }) {
  const [projects, setProjects] = useState([]);
  const [forms, setForms] = useState(isPreview ? [...initialForms, ...previewForms] : []);
  const [activeView, setActiveView] = useState('overview');
  const [selectedResponseFormId, setSelectedResponseFormId] = useState('');
  const [renamingFormId, setRenamingFormId] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [deletingFormId, setDeletingFormId] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(!isPreview);
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    if (isPreview) return undefined;

    const controller = new AbortController();
    async function loadDashboard() {
      setIsLoading(true);
      setError('');
      setLoadError(false);

      try {
        const projectsResponse = await apiRequest('/projects', accessToken, { signal: controller.signal });
        const loadedProjects = projectsResponse.data;
        if (!Array.isArray(loadedProjects)) {
          throw new Error('The server returned an invalid project list.');
        }

        const projectForms = await Promise.all(loadedProjects.map(async (project) => {
          const formsResponse = await apiRequest(
            `/projects/${encodeURIComponent(project.id)}/forms`,
            accessToken,
            { signal: controller.signal },
          );
          const projectFormList = formsResponse.data;
          if (!Array.isArray(projectFormList)) {
            throw new Error('The server returned an invalid form list.');
          }
          return projectFormList.map((form) => ({ ...form, projectId: project.id }));
        }));
        const allForms = projectForms.flat();
        const formsWithCounts = await Promise.all(allForms.map(async (form, index) => {
          const submissionsResponse = await apiRequest(
            `/projects/${encodeURIComponent(form.projectId)}/forms/${encodeURIComponent(form.id)}/submissions?limit=1`,
            accessToken,
            { signal: controller.signal },
          );
          const total = Number(submissionsResponse.meta?.total);
          if (!Number.isFinite(total)) {
            throw new Error('The server returned invalid submission totals.');
          }

          return {
            id: form.id,
            name: form.name,
            slug: form.slug,
            projectId: form.projectId,
            responses: total,
            updated: form.updated_at
              ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(form.updated_at))
              : '—',
            status: form.is_active ? 'Active' : 'Draft',
            color: ['sage', 'peach', 'lavender'][index % 3],
          };
        }));

        if (!controller.signal.aborted) {
          setProjects(loadedProjects);
          setForms(formsWithCounts);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setLoadError(true);
          setError(requestError instanceof TypeError
            ? 'Unable to reach the dashboard service. Check your connection and try again.'
            : requestError.message || 'Unable to load your workspace.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, [accessToken, isPreview, reloadKey]);

  const filteredForms = forms.filter((form) => form.name.toLowerCase().includes(search.toLowerCase()));
  const totalResponses = forms.reduce((total, form) => total + form.responses, 0);
  const greetingName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const initials = user?.name?.trim().charAt(0).toUpperCase() || 'J';

  async function changeFormStatus(form) {
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(form.projectId)}/forms/${encodeURIComponent(form.id)}`,
        accessToken,
        {
          method: 'PATCH',
          body: JSON.stringify({ is_active: form.status !== 'Active' }),
        },
      );
      setForms((currentForms) => currentForms.map((currentForm) => (
        currentForm.id === form.id
          ? { ...currentForm, status: result.data?.is_active ? 'Active' : 'Draft' }
          : currentForm
      )));
      setNotice(`${form.name} is now ${result.data?.is_active ? 'active' : 'inactive'}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this form.');
    }
  }

  async function renameForm(form) {
    const name = renameValue.trim();
    if (!name || name === form.name) {
      setRenamingFormId('');
      return;
    }
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(form.projectId)}/forms/${encodeURIComponent(form.id)}`,
        accessToken,
        { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) },
      );
      setForms((currentForms) => currentForms.map((currentForm) => (
        currentForm.id === form.id ? { ...currentForm, name: result.data?.name || name.trim() } : currentForm
      )));
      setRenamingFormId('');
      setNotice('Form name updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to rename this form.');
    }
  }

  async function removeForm(form) {
    try {
      await apiRequest(
        `/projects/${encodeURIComponent(form.projectId)}/forms/${encodeURIComponent(form.id)}`,
        accessToken,
        { method: 'DELETE' },
      );
      setForms((currentForms) => currentForms.filter((currentForm) => currentForm.id !== form.id));
      setDeletingFormId('');
      setNotice(`${form.name} was deleted.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete this form.');
    }
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <BrandMark />
        <div className="workspace-switcher">
          <span className="workspace-avatar">F</span>
          <span className="workspace-name"><strong>{projects[0]?.name || 'FormSlug Studio'}</strong><small>{isPreview ? 'Free workspace' : user?.email || 'Workspace'}</small></span>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="dashboard-nav" aria-label="Workspace navigation">
          <button className={`dashboard-nav-item${activeView === 'overview' ? ' active' : ''}`} type="button" onClick={() => setActiveView('overview')}>
            <LayoutDashboard size={17} /> Overview
          </button>
          <button className={`dashboard-nav-item${activeView === 'responses' ? ' active' : ''}`} type="button" onClick={() => {
            if (isPreview) {
              setNotice('Response management is available after connecting an account.');
            } else {
              setActiveView('responses');
            }
          }}>
            <Inbox size={17} /> Responses
            {!isPreview && <span className="nav-count">{totalResponses}</span>}
          </button>
          <button className={`dashboard-nav-item${activeView === 'settings' ? ' active' : ''}`} type="button" onClick={() => {
            if (isPreview) {
              setNotice('Account settings are available after connecting an account.');
            } else {
              setActiveView('settings');
            }
          }}>
            <Settings2 size={17} /> Settings
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="preview-card">
            <span className="preview-card-icon"><Sparkles size={15} /></span>
            <strong>{isPreview ? 'Preview mode' : 'Connected workspace'}</strong>
            <p>{isPreview ? 'Your sample workspace is stored only in this page.' : 'Your forms are synced with your account.'}</p>
          </div>
          <button className="profile-button" type="button" onClick={onLogout}>
            <span className="profile-avatar">{initials}</span>
            <span><strong>{user?.name || 'Jamie Parker'}</strong><small>Sign out</small></span>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeView === 'responses' ? 'Responses' : activeView === 'settings' ? 'Settings' : 'Overview'}</strong></div>
          <div className="topbar-actions">
            <span className="demo-pill"><span /> {isPreview ? 'Demo data' : 'Live data'}</span>
            <button className="icon-button" type="button" aria-label="Notifications" onClick={() => setNotice('You’re all caught up.')}>
              <Bell size={18} />
            </button>
            <button className="topbar-avatar" type="button" onClick={onLogout} aria-label="Sign out">{initials}</button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <div className="dashboard-eyebrow">{today}</div>
              <h1>Good morning, {isPreview ? 'Jamie' : greetingName} <span>✳</span></h1>
              <p>Here’s what’s happening with your forms today.</p>
            </div>
            <button className="create-form-button" type="button" onClick={() => onCreateForm(projects[0])} disabled={isLoading || loadError}>
              <Plus size={17} /> Create a form
            </button>
          </div>

          {error && (
            <div className="dashboard-notice dashboard-error" role="alert">
              {error}
              {loadError && (
                <button type="button" onClick={() => setReloadKey((currentKey) => currentKey + 1)}>
                  Retry
                </button>
              )}
            </div>
          )}
          {notice && (
            <div className="dashboard-notice" role="status">
              <Check size={16} /> {notice}
              <button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice">×</button>
            </div>
          )}

          {activeView === 'responses' ? (
            <ResponsesPanel
              forms={forms}
              accessToken={accessToken}
              onNotice={setNotice}
              initialFormId={selectedResponseFormId}
            />
          ) : activeView === 'settings' ? (
            <AccountSettings
              accessToken={accessToken}
              user={user}
              onUserUpdated={onUserUpdated}
              onLogout={onLogout}
            />
          ) : <>
          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-card-top"><span>Total responses</span><span className="stat-icon green"><Inbox size={17} /></span></div>
              <div className="stat-value">{isLoading || loadError ? '—' : totalResponses}</div>
              <div className="stat-foot"><span>Across your workspace</span></div>
              <div className="stat-sparkline sparkline-green" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Active forms</span><span className="stat-icon lavender"><FileText size={17} /></span></div>
              <div className="stat-value">{isLoading || loadError ? '—' : forms.filter((form) => form.status === 'Active').length}</div>
              <div className="stat-foot"><span>Across your workspace</span></div>
              <div className="stat-sparkline sparkline-lavender" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Workspace projects</span><span className="stat-icon peach"><Activity size={17} /></span></div>
              <div className="stat-value">{isLoading || loadError ? '—' : (isPreview ? 1 : projects.length)}</div>
              <div className="stat-foot"><span>Across your account</span></div>
              <div className="completion-track"><span /></div>
            </article>
          </div>

          <section className="forms-section">
            <div className="section-heading">
              <div><h2>Your forms</h2><p>A little overview of what you’re collecting.</p></div>
              <div className="forms-controls">
                <label className="form-search">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms" aria-label="Search forms" />
                </label>
                <button className="view-all-button" type="button" onClick={() => setSearch('')}>View all <ArrowUpRight size={15} /></button>
              </div>
            </div>

            <div className="forms-table">
              <div className="forms-table-head"><span>FORM NAME</span><span>RESPONSES</span><span>LAST UPDATED</span><span>STATUS</span><span /></div>
              {isLoading && <div className="empty-forms">Loading your forms...</div>}
              {loadError && <div className="empty-forms">Your forms could not be loaded.</div>}
              {!isLoading && filteredForms.map((form) => (
                <div className="form-row" key={form.id}>
                  <div className="form-name-cell">
                    <span className={`form-file-icon ${form.color}`}><FileText size={17} /></span>
                    {renamingFormId === form.id ? (
                      <form
                        className="inline-form-rename"
                        onSubmit={(event) => {
                          event.preventDefault();
                          renameForm(form);
                        }}
                      >
                        <input
                          aria-label={`New name for ${form.name}`}
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          maxLength={120}
                          autoFocus
                          required
                        />
                        <button type="submit" aria-label="Save form name" title="Save name"><Check size={14} /></button>
                        <button type="button" aria-label="Cancel form rename" title="Cancel" onClick={() => setRenamingFormId('')}><ArrowLeft size={14} /></button>
                      </form>
                    ) : (
                      <strong>{form.name}</strong>
                    )}
                  </div>
                  <span className="form-response-count">{form.responses}</span>
                  <span className="form-updated">{form.updated}</span>
                  <span className={`form-status ${form.status.toLowerCase()}`}><i />{form.status}</span>
                  <div className="row-actions">
                    {!isPreview && (
                      <>
                        <button
                          className="row-action-button"
                          type="button"
                          aria-label={`Rename ${form.name}`}
                          title="Rename form"
                          onClick={() => {
                            setRenameValue(form.name);
                            setRenamingFormId(form.id);
                            setDeletingFormId('');
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="row-action-button"
                          type="button"
                          aria-label={`View responses for ${form.name}`}
                          title="View responses"
                          onClick={() => {
                            setSelectedResponseFormId(form.id);
                            setActiveView('responses');
                          }}
                        >
                          <Inbox size={15} />
                        </button>
                        <button
                          className="row-action-button"
                          type="button"
                          aria-label={`${form.status === 'Active' ? 'Deactivate' : 'Activate'} ${form.name}`}
                          title={form.status === 'Active' ? 'Deactivate form' : 'Activate form'}
                          onClick={() => changeFormStatus(form)}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          className="row-action-button danger"
                          type="button"
                          aria-label={deletingFormId === form.id ? `Confirm delete ${form.name}` : `Delete ${form.name}`}
                          title={deletingFormId === form.id ? 'Confirm deletion' : 'Delete form'}
                          onClick={() => {
                            if (deletingFormId === form.id) {
                              removeForm(form);
                            } else {
                              setDeletingFormId(form.id);
                              setRenamingFormId('');
                            }
                          }}
                        >
                          {deletingFormId === form.id ? <Check size={15} /> : <Trash2 size={15} />}
                        </button>
                        {deletingFormId === form.id && (
                          <button
                            className="row-action-button"
                            type="button"
                            aria-label="Cancel form deletion"
                            title="Cancel deletion"
                            onClick={() => setDeletingFormId('')}
                          >
                            <ArrowLeft size={14} />
                          </button>
                        )}
                      </>
                    )}
                    {form.slug && (
                      <button
                        className="row-action-button"
                        type="button"
                        aria-label={`Copy public endpoint for ${form.name}`}
                        title="Copy public endpoint"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(getPublicFormUrl(form.slug));
                            setNotice('Public submission URL copied.');
                          } catch {
                            setError('Clipboard access is unavailable in this browser.');
                          }
                        }}
                      >
                        <Copy size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!isLoading && !loadError && filteredForms.length === 0 && (
                <div className="empty-forms">
                  {search ? `No forms match “${search}”.` : 'No forms yet. Create your first form to get started.'}
                </div>
              )}
            </div>
            <div className="table-footnote"><span className="live-dot" /> {isPreview ? 'Showing sample data · No API connection' : 'Showing live data from your workspace'}</div>
          </section>
          </>}

          <footer className="dashboard-footer">
            <span>Made for better conversations.</span>
            <button type="button" onClick={onLogout}>Sign out <ArrowRight size={14} /></button>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState('auth');
  const [accessToken, setAccessToken] = useState('');
  const [user, setUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [builderProject, setBuilderProject] = useState(null);
  const [previewForms, setPreviewForms] = useState([]);
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';

  useEffect(() => {
    let isMounted = true;
    restoreSession()
      .then((session) => {
        if (!isMounted || !session) return;
        activeAccessToken = session.token;
        setAccessToken(session.token);
        setUser(session.user);
        setPage('dashboard');
      })
      .catch((restoreError) => {
        if (isMounted) setError(restoreError.message || 'Unable to restore your session.');
      })
      .finally(() => {
        if (isMounted) setIsRestoringSession(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      if (accessToken) await apiRequest('/auth/logout', accessToken, { method: 'POST' });
    } catch (logoutError) {
      setError(logoutError.message || 'Unable to revoke your session.');
    } finally {
      activeAccessToken = '';
      setPage('auth');
      setAccessToken('');
      setUser(null);
      setIsPreview(false);
      setPreviewForms([]);
      setMode('login');
    }
  }

  if (page === 'builder') {
    return (
      <FormBuilder
        onBack={() => setPage('dashboard')}
        onSaved={(previewForm) => {
          if (previewForm) setPreviewForms((currentForms) => [previewForm, ...currentForms]);
          setPage('dashboard');
        }}
        accessToken={accessToken}
        project={builderProject}
        isPreview={isPreview}
      />
    );
  }

  if (page === 'dashboard') {
    return (
      <Dashboard
        onCreateForm={(project) => {
          setBuilderProject(project || null);
          setPage('builder');
        }}
        onLogout={handleLogout}
        onUserUpdated={setUser}
        accessToken={accessToken}
        user={user}
        isPreview={isPreview}
        previewForms={previewForms}
      />
    );
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    setError('');
    setNotice('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister
          ? { name: name.trim(), email, password }
          : { email, password }),
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('The server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        const validationErrors = Array.isArray(result.details)
          ? result.details
            .map((detail) => detail?.field
              ? `${detail.field}: ${detail.message}`
              : detail?.message)
            .filter(Boolean)
            .join(' ')
          : '';
        throw new Error(validationErrors || result.error || 'Authentication failed. Please try again.');
      }

      if (isRegister) {
        setMode('login');
        setPassword('');
        setNotice('Account created. Sign in with your new credentials.');
        return;
      }

      if (!result.data?.accessToken || !result.data?.user) {
        throw new Error('The server returned an invalid sign-in response. Please try again.');
      }

      setAccessToken(result.data.accessToken);
      activeAccessToken = result.data.accessToken;
      setUser(result.data.user);
      setIsPreview(false);
      setPage('dashboard');
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Unable to reach the authentication service. Check your connection and try again.'
        : requestError.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isRestoringSession) {
    return <main className="session-restoring" role="status">Restoring your workspace…</main>;
  }

  return (
    <main className="page-shell">
      <section className="story-panel">
        <div className="story-inner">
          <BrandMark light />
          <div className="story-copy">
            <div className="eyebrow"><span /> YOUR FORMS, IN GOOD HANDS</div>
            <h1>Make space for<br />the <em>good stuff.</em></h1>
            <p>Thoughtful forms make it easier to hear what matters. Start collecting the responses that move you forward.</p>
          </div>
          <WordmarkIllustration />
          <div className="story-footer">
            <span>Simple to set up. A joy to use.</span>
            <span className="story-footer-mark">F<span>.</span></span>
          </div>
        </div>
        <div className="story-grain" aria-hidden="true" />
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><BrandMark /></div>
        <div className="auth-content">
          <>
              <div className="auth-heading">
                <div className="auth-kicker">{isRegister ? 'A FRESH START' : 'WELCOME BACK'}</div>
                <h2>{isRegister ? 'Create your account' : 'Sign in to FormSlug'}</h2>
                <p className="auth-subtitle">
                  {isRegister
                    ? 'A better way to collect, manage, and understand every response.'
                    : 'Pick up where you left off. Your responses are waiting.'}
                </p>
              </div>

              <div className="auth-tabs" role="group" aria-label="Account access">
                <button
                  className={`auth-tab${isRegister ? ' active' : ''}`}
                  aria-pressed={isRegister}
                  onClick={() => changeMode('register')}
                  disabled={isLoading}
                  type="button"
                >
                  Create account
                </button>
                <button
                  className={`auth-tab${!isRegister ? ' active' : ''}`}
                  aria-pressed={!isRegister}
                  onClick={() => changeMode('login')}
                  disabled={isLoading}
                  type="button"
                >
                  Sign in
                </button>
              </div>

              {notice && <div className="notice-message" role="status"><Check size={17} />{notice}</div>}
              {error && <div className="error-message" role="alert">{error}</div>}

              <form className="auth-form" onSubmit={handleSubmit}>
                {isRegister && (
                  <Field
                    id="name"
                    label="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Jamie Parker"
                    icon={UserRound}
                    autoComplete="name"
                    disabled={isLoading}
                  />
                )}
                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  icon={Mail}
                  autoComplete="email"
                  disabled={isLoading}
                />
                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  icon={LockKeyhole}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  disabled={isLoading}
                  trailing={
                    <button
                      className="password-toggle"
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      disabled={isLoading}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
                {!isRegister && (
                  <div className="form-meta">
                    <span className="secure-note"><LockKeyhole size={13} /> Secure sign in</span>
                    <span className="password-hint">Forgot password? Contact support</span>
                  </div>
                )}
                {isRegister && (
                  <p className="terms-note">
                    By creating an account, you agree to use FormSlug responsibly and keep your sign-in details secure.
                  </p>
                )}
                <button className="submit-button" type="submit" disabled={isLoading}>
                  <span>{isLoading
                    ? (isRegister ? 'Creating account...' : 'Signing in...')
                    : (isRegister ? 'Create your account' : 'Sign in')}</span>
                  {isLoading
                    ? <span className="button-spinner" aria-hidden="true" />
                    : <ArrowRight size={17} strokeWidth={2.2} />}
                </button>
              </form>

              <div className="form-bottom">
                <span className="bottom-rule" />
                <p>
                  {isRegister ? 'Already have an account?' : 'New to FormSlug?'}
                  <button type="button" disabled={isLoading} onClick={() => changeMode(isRegister ? 'login' : 'register')}>
                    {isRegister ? ' Sign in' : ' Create an account'}
                  </button>
                </p>
                <span className="bottom-rule" />
              </div>
              <button className="preview-link" type="button" disabled={isLoading} onClick={() => {
                setIsPreview(true);
                setPage('dashboard');
              }}>
                Preview the workspace <ArrowRight size={14} />
              </button>
              <div className="privacy-note"><LockKeyhole size={13} /> Your information is encrypted and kept private.</div>
          </>
        </div>
        <footer className="auth-footer">
          <span>© {new Date().getFullYear()} FormSlug</span>
          <span className="footer-divider" />
          <span>Built for better conversations</span>
          <a href={API_DOCS_URL} target="_blank" rel="noreferrer" aria-label="Open API documentation">
            API docs <MoveUpRight size={13} />
          </a>
        </footer>
      </section>
    </main>
  );
}
