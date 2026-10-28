import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
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
  Webhook,
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

const tutorialSteps = [
  {
    title: 'Start with a project',
    section: '01 / ORGANIZE',
    description: 'Projects keep related forms together. Open Projects in the sidebar to create a project, then choose it from the workspace selector.',
    tip: 'You can create separate projects for different teams, clients, or workflows.',
  },
  {
    title: 'Build your first form',
    section: '02 / CREATE',
    description: 'Choose a project, open Forms, and select New form. Add the fields you need in the builder, preview the form, and save it when it is ready.',
    tip: 'The builder preview is local. Submit a real response through the published form to save it to your workspace.',
  },
  {
    title: 'Publish and share',
    section: '03 / PUBLISH',
    description: 'Activate a form when you are ready to accept responses. Each active form has a public URL based on its slug that you can share or connect to your site.',
    tip: 'You can also submit JSON to the form URL from your own application. Form API keys are shown only when created or rotated, so store them securely.',
  },
  {
    title: 'Review incoming responses',
    section: '04 / RESPONSES',
    description: 'Open Responses from the sidebar or the notification bell to review submissions. You can export responses as CSV and restore submissions you have soft-deleted.',
    tip: 'Use the form selector in Responses to focus on submissions for one form.',
  },
  {
    title: 'Connect the rest of your workflow',
    section: '05 / AUTOMATE',
    description: 'Set up project webhooks to send submission events to another service, or open Settings to update your account details and password.',
    tip: 'Webhook endpoints must use HTTPS. Save the signing secret when it is first shown; you cannot retrieve it later.',
  },
];

function TutorialGuide({ onDismiss }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = tutorialSteps[stepIndex];

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onDismiss();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <div className="tutorial-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onDismiss();
    }}>
      <section
        className="tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        aria-describedby="tutorial-description"
      >
        <div className="tutorial-topline">
          <span><BookOpen size={16} /> FORMSLUG QUICK GUIDE</span>
          <button type="button" className="tutorial-close" onClick={onDismiss} aria-label="Close tutorial">×</button>
        </div>
        <div className="tutorial-progress" aria-label={`Step ${stepIndex + 1} of ${tutorialSteps.length}`}>
          {tutorialSteps.map((tutorialStep, index) => (
            <span key={tutorialStep.section} className={index <= stepIndex ? 'complete' : ''} />
          ))}
        </div>
        <div className="tutorial-step-label">{step.section}</div>
        <h2 id="tutorial-title">{step.title}</h2>
        <p id="tutorial-description">{step.description}</p>
        <div className="tutorial-tip">
          <Sparkles size={16} />
          <span>{step.tip}</span>
        </div>
        <div className="tutorial-footer">
          <button className="tutorial-skip" type="button" onClick={onDismiss}>Skip guide</button>
          <div className="tutorial-controls">
            {stepIndex > 0 && (
              <button className="tutorial-previous" type="button" onClick={() => setStepIndex((current) => current - 1)}>
                <ArrowLeft size={15} /> Back
              </button>
            )}
            <button
              className="tutorial-next"
              type="button"
              onClick={() => {
                if (stepIndex === tutorialSteps.length - 1) {
                  onDismiss();
                } else {
                  setStepIndex((current) => current + 1);
                }
              }}
            >
              {stepIndex === tutorialSteps.length - 1 ? 'Finish guide' : 'Next'} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
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

function FormBuilder({ onBack, onSaved, accessToken, project }) {
  const [title, setTitle] = useState('Untitled form');
  const [description, setDescription] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [fields, setFields] = useState([
    { id: 1, label: 'Your name', type: 'text', placeholder: 'Enter your answer', required: true },
  ]);
  const [previewResponses, setPreviewResponses] = useState({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPreviewSubmitted(false);
  }, [title, description, fields]);

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

    if (!project?.id) {
      setError('Select a project before creating a form.');
      return;
    }

    setIsSaving(true);
    try {
      const formResponse = await apiRequest(
        `/projects/${encodeURIComponent(project.id)}/forms`,
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
        <div className="builder-save-state"><span /> Unsaved changes</div>
        <button className="builder-save-button" type="submit" form="form-builder" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save form'}
          {!isSaving && <ArrowRight size={15} />}
        </button>
      </header>

      <div className="builder-content">
        <div className="builder-heading">
          <div className="dashboard-eyebrow">FORM BUILDER</div>
          <h1>Build your form</h1>
          <p>{project?.name ? `Creating a form in ${project.name}. ` : ''}Shape the questions and preview what people will see.</p>
        </div>

        {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}

        <div className="builder-layout">
          <section className="builder-editor" aria-label="Edit form">
            <form id="form-builder" className="builder-editor-form" onSubmit={saveForm}>
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
            </form>
          </section>

          <aside className="builder-preview" aria-label="Form preview">
            <div className="builder-preview-heading"><span>LIVE PREVIEW</span><Eye size={15} /></div>
            <div className="builder-preview-canvas">
              <div className="builder-preview-brand"><span><Shapes size={14} /></span> formslug</div>
              <div className="builder-preview-form">
                {previewSubmitted ? (
                  <div className="builder-preview-success" role="status">
                    <span className="builder-preview-eyebrow">RESPONSE COMPLETE</span>
                    <h2>Thanks for your response!</h2>
                    <p>Your test response was submitted in this preview only.</p>
                    <button
                      className="builder-preview-submit"
                      type="button"
                      onClick={() => {
                        setPreviewResponses({});
                        setPreviewSubmitted(false);
                      }}
                    >
                      Send another response <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      setPreviewSubmitted(true);
                    }}
                  >
                    <span className="builder-preview-eyebrow">NEW RESPONSE</span>
                    <h2>{title.trim() || 'Untitled form'}</h2>
                    {description && <p className="builder-preview-description">{description}</p>}
                    {fields.map((field, index) => (
                      <label className="builder-preview-question" key={field.id}>
                        <span>{field.label.trim() || `Question ${index + 1}`}{field.required && <i>*</i>}</span>
                        {field.type === 'textarea'
                          ? (
                            <textarea
                              placeholder={field.placeholder || 'Your answer'}
                              rows={3}
                              required={field.required}
                              value={previewResponses[field.id] || ''}
                              onChange={(event) => {
                                setPreviewResponses((current) => ({ ...current, [field.id]: event.target.value }));
                                setPreviewSubmitted(false);
                              }}
                            />
                          )
                          : (
                            <input
                              type={field.type}
                              placeholder={field.placeholder || 'Your answer'}
                              required={field.required}
                              value={previewResponses[field.id] || ''}
                              onChange={(event) => {
                                setPreviewResponses((current) => ({ ...current, [field.id]: event.target.value }));
                                setPreviewSubmitted(false);
                              }}
                            />
                          )}
                      </label>
                    ))}
                    <button className="builder-preview-submit" type="submit">
                      Send response <ArrowRight size={14} />
                    </button>
                    <small className="builder-preview-foot"><LockKeyhole size={11} /> Test responses stay in this preview.</small>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSubmissionId, setLoadingSubmissionId] = useState('');
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
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setSubmissions([]);
      setMeta({ total: 0, totalPages: 0 });
      setError('The start date must be on or before the end date.');
      return undefined;
    }

    const controller = new AbortController();
    async function loadSubmissions() {
      setIsLoading(true);
      setError('');
      setSelectedSubmission(null);
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: '20',
          includeDeleted: String(includeDeleted),
        });
        if (dateFrom) query.set('from', new Date(`${dateFrom}T00:00:00.000Z`).toISOString());
        if (dateTo) query.set('to', new Date(`${dateTo}T23:59:59.999Z`).toISOString());
        const result = await apiRequest(
          `/projects/${encodeURIComponent(selectedForm.projectId)}/forms/${encodeURIComponent(selectedForm.id)}/submissions?${query}`,
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
  }, [accessToken, dateFrom, dateTo, includeDeleted, page, reloadKey, selectedForm]);

  async function toggleSubmissionDetails(submission) {
    if (selectedSubmission?.id === submission.id) {
      setSelectedSubmission(null);
      return;
    }

    setError('');
    setLoadingSubmissionId(submission.id);
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(selectedForm.projectId)}/forms/${encodeURIComponent(selectedForm.id)}/submissions/${encodeURIComponent(submission.id)}`,
        accessToken,
      );
      if (!result.data?.id) throw new Error('The server returned an invalid submission.');
      setSelectedSubmission(result.data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load this response.');
    } finally {
      setLoadingSubmissionId('');
    }
  }

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
          <label className="response-date-filter">
            <span>From</span>
            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }} />
          </label>
          <label className="response-date-filter">
            <span>To</span>
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }} />
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
                onClick={() => toggleSubmissionDetails(submission)}
              >
                {loadingSubmissionId === submission.id
                  ? 'Loading response…'
                  : Object.entries(submission.data || {}).slice(0, 2).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || 'View submission'}
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

function ProjectsPanel({ accessToken, projects, onProjectCreated, onProjectUpdated, onProjectDeleted }) {
  const [projectName, setProjectName] = useState('');
  const [editingProjectId, setEditingProjectId] = useState('');
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjectId, setLoadingProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function createProject(event) {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return;

    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const result = await apiRequest('/projects', accessToken, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      if (!result.data?.id || !result.data?.name) {
        throw new Error('The server returned an invalid project.');
      }
      onProjectCreated(result.data);
      setProjectName('');
      setNotice('Project created.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the project.');
    } finally {
      setIsSaving(false);
    }
  }

  async function updateProject(project) {
    const name = editingName.trim();
    if (!name) {
      setError('Enter a project name before saving.');
      return;
    }
    if (name === project.name) {
      setEditingProjectId('');
      setError('');
      return;
    }

    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const result = await apiRequest(`/projects/${encodeURIComponent(project.id)}`, accessToken, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      if (!result.data?.id) {
        throw new Error('The server returned an invalid project.');
      }
      const updatedProject = { ...project, ...result.data, name: result.data.name || name };
      onProjectUpdated(updatedProject);
      setSelectedProject((current) => current?.id === project.id ? updatedProject : current);
      setEditingProjectId('');
      setNotice('Project updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the project.');
    } finally {
      setIsSaving(false);
    }
  }

  async function viewProject(project) {
    setError('');
    setNotice('');
    setSelectedProject(null);
    setLoadingProjectId(project.id);
    try {
      const result = await apiRequest(`/projects/${encodeURIComponent(project.id)}`, accessToken);
      if (!result.data?.id || !result.data?.name) {
        throw new Error('The server returned an invalid project.');
      }
      setSelectedProject(result.data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load the project.');
    } finally {
      setLoadingProjectId('');
    }
  }

  async function deleteProject(project) {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      await apiRequest(`/projects/${encodeURIComponent(project.id)}`, accessToken, { method: 'DELETE' });
      onProjectDeleted(project.id);
      setConfirmDeleteId('');
      setSelectedProject(null);
      setNotice(`${project.name} was deleted.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the project.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="projects-panel" aria-label="Projects">
      <div className="settings-heading">
        <div>
          <h2>Projects</h2>
          <p>Create projects and manage their details.</p>
        </div>
      </div>
      {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}
      {notice && <div className="dashboard-notice" role="status">{notice}</div>}
      <form className="project-create-card" onSubmit={createProject}>
        <label className="settings-field" htmlFor="new-project-name">
          <span>Project name</span>
          <input
            id="new-project-name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            maxLength={120}
            placeholder="e.g. Customer research"
            required
            disabled={isSaving}
          />
        </label>
        <button className="settings-submit" type="submit" disabled={isSaving || !projectName.trim()}>
          <Plus size={14} /> {isSaving ? 'Creating…' : 'Create project'}
        </button>
      </form>

      <div className="project-list">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            {editingProjectId === project.id ? (
              <form
                className="project-rename-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  updateProject(project);
                }}
              >
                <label className="settings-field" htmlFor={`project-name-${project.id}`}>
                  <span>Project name</span>
                  <input
                    id={`project-name-${project.id}`}
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    maxLength={120}
                    required
                    autoFocus
                    disabled={isSaving}
                  />
                </label>
                <div className="project-actions">
                  <button className="settings-submit" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving…' : 'Save project'}
                  </button>
                  <button
                    className="settings-cancel"
                    type="button"
                    onClick={() => setEditingProjectId('')}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="project-card-heading">
                  <span className="project-card-icon"><Shapes size={17} /></span>
                  <div>
                    <h3>{project.name}</h3>
                    <p>Project ID: {project.id}</p>
                  </div>
                </div>
                <div className="project-actions">
                  <button
                    className="settings-cancel"
                    type="button"
                    onClick={() => viewProject(project)}
                    disabled={Boolean(loadingProjectId)}
                  >
                    <Eye size={14} /> {loadingProjectId === project.id ? 'Loading…' : 'View project'}
                  </button>
                  <button
                    className="settings-cancel"
                    type="button"
                    onClick={() => {
                      setError('');
                      setEditingName(project.name);
                      setEditingProjectId(project.id);
                    }}
                  >
                    <Pencil size={14} /> Edit name
                  </button>
                  {confirmDeleteId === project.id ? (
                    <>
                      <button
                        className="settings-delete"
                        type="button"
                        onClick={() => deleteProject(project)}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button
                        className="settings-cancel"
                        type="button"
                        onClick={() => setConfirmDeleteId('')}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="settings-delete"
                      type="button"
                      onClick={() => setConfirmDeleteId(project.id)}
                    >
                      <Trash2 size={14} /> Delete project
                    </button>
                  )}
                </div>
                {selectedProject?.id === project.id && (
                  <dl className="project-details">
                    <div><dt>Name</dt><dd>{selectedProject.name}</dd></div>
                    <div><dt>Project ID</dt><dd>{selectedProject.id}</dd></div>
                    {selectedProject.created_at && (
                      <div>
                        <dt>Created</dt>
                        <dd>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(selectedProject.created_at))}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </>
            )}
          </article>
        ))}
        {projects.length === 0 && <div className="empty-forms">No projects yet. Create your first project above.</div>}
      </div>
    </section>
  );
}

function FormDetailsPanel({ accessToken, form, onRotated }) {
  const [details, setDetails] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [submissionPayload, setSubmissionPayload] = useState('{\n  "message": "Test submission"\n}');
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmRotation, setConfirmRotation] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadDetails() {
      try {
        const result = await apiRequest(
          `/projects/${encodeURIComponent(form.projectId)}/forms/${encodeURIComponent(form.id)}`,
          accessToken,
          { signal: controller.signal },
        );
        if (!result.data?.id) throw new Error('The server returned an invalid form.');
        if (!controller.signal.aborted) setDetails(result.data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || 'Unable to load form details.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadDetails();
    return () => controller.abort();
  }, [accessToken, form.id, form.projectId]);

  async function rotateApiKey() {
    setError('');
    setNotice('');
    setIsRotating(true);
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(form.projectId)}/forms/${encodeURIComponent(form.id)}/rotate-key`,
        accessToken,
        { method: 'POST' },
      );
      if (!result.data?.api_key) throw new Error('The server returned an invalid API key.');
      setApiKey(result.data.api_key);
      setConfirmRotation(false);
      setNotice('API key rotated. Copy and store this key now; it will not be shown again.');
      onRotated();
    } catch (requestError) {
      setError(requestError.message || 'Unable to rotate the form API key.');
    } finally {
      setIsRotating(false);
    }
  }

  async function submitTest(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    let payload;
    try {
      payload = JSON.parse(submissionPayload);
    } catch {
      setError('Enter a valid JSON object for the test submission.');
      return;
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      setError('The test submission must be a JSON object.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(getPublicFormUrl(form.slug), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let result = {};
      try {
        result = await response.json();
      } catch {
        throw new Error('The public endpoint returned an invalid response.');
      }
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Unable to send the test submission.');
      }
      setNotice('Test submission accepted by the public endpoint.');
    } catch (requestError) {
      setError(requestError instanceof TypeError
        ? 'Unable to reach the public submission endpoint.'
        : requestError.message || 'Unable to send the test submission.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="form-details-panel" aria-label={`${form.name} details`}>
      {isLoading && <div className="empty-forms">Loading form details…</div>}
      {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}
      {notice && <div className="dashboard-notice" role="status">{notice}</div>}
      {details && (
        <>
          <dl className="project-details">
            <div><dt>Form ID</dt><dd>{details.id}</dd></div>
            <div><dt>Project ID</dt><dd>{form.projectId}</dd></div>
            <div><dt>Public slug</dt><dd>{details.slug || form.slug || 'Unavailable'}</dd></div>
            <div><dt>Status</dt><dd>{details.is_active ? 'Active' : 'Draft'}</dd></div>
            {details.notification_email && <div><dt>Notifications</dt><dd>{details.notification_email}</dd></div>}
            {details.config && <div><dt>Configuration</dt><dd><pre>{JSON.stringify(details.config, null, 2)}</pre></dd></div>}
          </dl>
          <div className="form-detail-key">
            <div>
              <strong>Submission API key</strong>
              <p>Rotate this key if it has been exposed. Existing integrations must then use the new key.</p>
            </div>
            {confirmRotation ? (
              <div className="project-actions">
                <button className="settings-delete" type="button" onClick={rotateApiKey} disabled={isRotating}>
                  {isRotating ? 'Rotating…' : 'Confirm key rotation'}
                </button>
                <button className="settings-cancel" type="button" onClick={() => setConfirmRotation(false)} disabled={isRotating}>Cancel</button>
              </div>
            ) : (
              <button className="settings-cancel" type="button" onClick={() => {
                setApiKey('');
                setConfirmRotation(true);
              }}>
                Rotate API key
              </button>
            )}
            {apiKey && (
              <label className="settings-field">
                <span>New API key — copy it now</span>
                <input value={apiKey} readOnly onFocus={(event) => event.target.select()} />
              </label>
            )}
          </div>
          {details.slug && (
            <form className="public-test-form" onSubmit={submitTest}>
              <div>
                <strong>Test public submission</strong>
                <p>Posts this JSON to the public endpoint. The form must be active to accept submissions.</p>
              </div>
              <label className="settings-field" htmlFor={`public-test-${form.id}`}>
                <span>JSON payload</span>
                <textarea
                  id={`public-test-${form.id}`}
                  value={submissionPayload}
                  onChange={(event) => setSubmissionPayload(event.target.value)}
                  rows={5}
                  disabled={isSubmitting}
                />
              </label>
              <button className="settings-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send test submission'}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}

function WebhooksPanel({ accessToken, projects }) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [webhooks, setWebhooks] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [editingWebhookId, setEditingWebhookId] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [confirmDeleteWebhookId, setConfirmDeleteWebhookId] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id || '');
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setWebhooks([]);
      return undefined;
    }
    const controller = new AbortController();
    async function loadWebhooks() {
      setIsLoading(true);
      setError('');
      setNewSecret('');
      try {
        const result = await apiRequest(
          `/projects/${encodeURIComponent(selectedProjectId)}/webhooks`,
          accessToken,
          { signal: controller.signal },
        );
        if (!Array.isArray(result.data)) throw new Error('The server returned an invalid webhook list.');
        if (!controller.signal.aborted) setWebhooks(result.data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.message || 'Unable to load webhooks.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    loadWebhooks();
    return () => controller.abort();
  }, [accessToken, selectedProjectId]);

  async function createWebhook(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setNewSecret('');
    setIsSaving(true);
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(selectedProjectId)}/webhooks`,
        accessToken,
        { method: 'POST', body: JSON.stringify({ url: webhookUrl.trim() }) },
      );
      if (!result.data?.id || !result.data?.secret) {
        throw new Error('The server returned an invalid webhook response.');
      }
      const webhook = { ...result.data };
      delete webhook.secret;
      setWebhooks((current) => [webhook, ...current]);
      setNewSecret(result.data.secret);
      setWebhookUrl('');
      setNotice('Webhook created. Copy and store the signing secret now; it will not be shown again.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the webhook.');
    } finally {
      setIsSaving(false);
    }
  }

  async function updateWebhook(webhook, updates) {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(selectedProjectId)}/webhooks/${encodeURIComponent(webhook.id)}`,
        accessToken,
        { method: 'PATCH', body: JSON.stringify(updates) },
      );
      if (!result.data?.id) throw new Error('The server returned an invalid webhook response.');
      setWebhooks((current) => current.map((item) => item.id === webhook.id ? result.data : item));
      setEditingWebhookId('');
      setNotice('Webhook updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the webhook.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteWebhook(webhook) {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      await apiRequest(
        `/projects/${encodeURIComponent(selectedProjectId)}/webhooks/${encodeURIComponent(webhook.id)}`,
        accessToken,
        { method: 'DELETE' },
      );
      setWebhooks((current) => current.filter((item) => item.id !== webhook.id));
      setConfirmDeleteWebhookId('');
      setNotice('Webhook deleted.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the webhook.');
    } finally {
      setIsSaving(false);
    }
  }

  async function testWebhook(webhook) {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const result = await apiRequest(
        `/projects/${encodeURIComponent(selectedProjectId)}/webhooks/${encodeURIComponent(webhook.id)}/test`,
        accessToken,
        { method: 'POST' },
      );
      if (!result.data || typeof result.data.delivered !== 'boolean') {
        throw new Error('The server returned an invalid test-delivery response.');
      }
      setNotice(result.data.delivered
        ? `Test delivered (HTTP ${result.data.statusCode}).`
        : `Test delivery failed${result.data.error ? `: ${result.data.error}` : '.'}`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to test the webhook.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="webhooks-panel" aria-label="Project webhooks">
      <div className="settings-heading">
        <div><h2>Webhooks</h2><p>Send submission events to your HTTPS endpoints.</p></div>
        <label className="settings-field">
          <span>Project</span>
          <select
            aria-label="Webhook project"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            disabled={!projects.length}
          >
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
      </div>
      {error && <div className="dashboard-notice dashboard-error" role="alert">{error}</div>}
      {notice && <div className="dashboard-notice" role="status">{notice}</div>}
      {newSecret && (
        <label className="settings-field webhook-secret">
          <span>Signing secret — copy it now</span>
          <input value={newSecret} readOnly onFocus={(event) => event.target.select()} />
        </label>
      )}
      {!projects.length ? (
        <div className="empty-forms">Create a project before configuring webhooks.</div>
      ) : (
        <>
          <form className="webhook-create-card" onSubmit={createWebhook}>
            <label className="settings-field" htmlFor="new-webhook-url">
              <span>HTTPS endpoint URL</span>
              <input
                id="new-webhook-url"
                type="url"
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                placeholder="https://example.com/webhooks"
                pattern="https://.*"
                title="Webhook URLs must use HTTPS."
                required
                disabled={isSaving}
              />
            </label>
            <button className="settings-submit" type="submit" disabled={isSaving || !selectedProjectId}>
              {isSaving ? 'Creating…' : 'Add webhook'}
            </button>
          </form>
          <div className="webhook-list">
            {isLoading && <div className="empty-forms">Loading webhooks…</div>}
            {!isLoading && webhooks.map((webhook) => (
              <article className="webhook-card" key={webhook.id}>
                <div className="webhook-card-heading">
                  <span className={`form-status ${webhook.is_active ? 'active' : 'draft'}`}><i />{webhook.is_active ? 'Active' : 'Paused'}</span>
                  {editingWebhookId === webhook.id ? (
                    <form
                      className="webhook-edit-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateWebhook(webhook, { url: editingUrl.trim() });
                      }}
                    >
                      <input
                        aria-label="Webhook endpoint URL"
                        type="url"
                        pattern="https://.*"
                        value={editingUrl}
                        onChange={(event) => setEditingUrl(event.target.value)}
                        required
                        disabled={isSaving}
                      />
                      <button className="settings-submit" type="submit" disabled={isSaving}>Save URL</button>
                      <button className="settings-cancel" type="button" onClick={() => setEditingWebhookId('')} disabled={isSaving}>Cancel</button>
                    </form>
                  ) : <code>{webhook.url}</code>}
                </div>
                <div className="project-actions">
                  <button
                    className="settings-cancel"
                    type="button"
                    onClick={() => updateWebhook(webhook, { is_active: !webhook.is_active })}
                    disabled={isSaving}
                  >
                    {webhook.is_active ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    className="settings-cancel"
                    type="button"
                    onClick={() => {
                      setEditingWebhookId(webhook.id);
                      setEditingUrl(webhook.url);
                    }}
                    disabled={isSaving}
                  >Edit URL</button>
                  <button className="settings-cancel" type="button" onClick={() => testWebhook(webhook)} disabled={isSaving}>
                    {isSaving ? 'Working…' : 'Send test'}
                  </button>
                  {confirmDeleteWebhookId === webhook.id ? (
                    <>
                      <button className="settings-delete" type="button" onClick={() => deleteWebhook(webhook)} disabled={isSaving}>
                        {isSaving ? 'Deleting…' : 'Confirm delete'}
                      </button>
                      <button className="settings-cancel" type="button" onClick={() => setConfirmDeleteWebhookId('')} disabled={isSaving}>Cancel</button>
                    </>
                  ) : (
                    <button className="settings-delete" type="button" onClick={() => setConfirmDeleteWebhookId(webhook.id)} disabled={isSaving}>
                      Delete
                    </button>
                  )}
                </div>
                <small>Created {webhook.created_at ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(webhook.created_at)) : '—'}</small>
              </article>
            ))}
            {!isLoading && webhooks.length === 0 && <div className="empty-forms">No webhooks for this project yet.</div>}
          </div>
        </>
      )}
    </section>
  );
}

function Dashboard({ onLogout, onUserUpdated, onCreateForm, accessToken, user }) {
  const [projects, setProjects] = useState([]);
  const [forms, setForms] = useState([]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedResponseFormId, setSelectedResponseFormId] = useState('');
  const [selectedFormDetailsId, setSelectedFormDetailsId] = useState('');
  const [renamingFormId, setRenamingFormId] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [deletingFormId, setDeletingFormId] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const tutorialStorageKey = user?.id ? `formslug:tutorial-seen:${user.id}` : '';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    if (tutorialStorageKey && window.localStorage.getItem(tutorialStorageKey) !== 'true') {
      setIsTutorialOpen(true);
    }
  }, [tutorialStorageKey]);

  function dismissTutorial() {
    if (tutorialStorageKey) window.localStorage.setItem(tutorialStorageKey, 'true');
    setIsTutorialOpen(false);
  }

  useEffect(() => {
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
  }, [accessToken, reloadKey]);

  useEffect(() => {
    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id || '');
    }
  }, [projects, selectedProjectId]);

  const filteredForms = forms.filter((form) => (
    (!selectedProjectId || form.projectId === selectedProjectId)
    && form.name.toLowerCase().includes(search.toLowerCase())
  ));
  const totalResponses = forms.reduce((total, form) => total + form.responses, 0);
  const greetingName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const initials = user?.name?.trim().charAt(0).toUpperCase() || 'J';
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  function selectProject(projectId) {
    setSelectedProjectId(projectId);
    setSearch('');
    setActiveView('forms');
  }

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
      setSelectedFormDetailsId((currentId) => currentId === form.id ? '' : currentId);
      setDeletingFormId('');
      setNotice(`${form.name} was deleted.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete this form.');
    }
  }

  return (
    <main className="dashboard-shell">
      {isTutorialOpen && <TutorialGuide onDismiss={dismissTutorial} />}
      <aside className="dashboard-sidebar">
        <BrandMark />
        <div className="workspace-switcher">
          <span className="workspace-avatar">F</span>
          <span className="workspace-name">
            <strong>{selectedProject?.name || 'Select a project'}</strong>
            <small>{user?.email || 'Workspace'}</small>
          </span>
          <select
            className="workspace-project-select"
            aria-label="Select project"
            value={selectedProjectId}
            onChange={(event) => selectProject(event.target.value)}
            disabled={isLoading || projects.length === 0}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="dashboard-nav" aria-label="Workspace navigation">
          <button className={`dashboard-nav-item${activeView === 'overview' ? ' active' : ''}`} type="button" onClick={() => setActiveView('overview')}>
            <LayoutDashboard size={17} /> Overview
          </button>
          <button className={`dashboard-nav-item${activeView === 'forms' ? ' active' : ''}`} type="button" onClick={() => setActiveView('forms')}>
            <FileText size={17} /> Forms
          </button>
          <button className={`dashboard-nav-item${activeView === 'projects' ? ' active' : ''}`} type="button" onClick={() => setActiveView('projects')}>
            <Shapes size={17} /> Projects
          </button>
          <button className={`dashboard-nav-item${activeView === 'webhooks' ? ' active' : ''}`} type="button" onClick={() => setActiveView('webhooks')}>
            <Webhook size={17} /> Webhooks
          </button>
          <button className={`dashboard-nav-item${activeView === 'responses' ? ' active' : ''}`} type="button" onClick={() => setActiveView('responses')}>
            <Inbox size={17} /> Responses
            <span className="nav-count">{totalResponses}</span>
          </button>
          <button className={`dashboard-nav-item${activeView === 'settings' ? ' active' : ''}`} type="button" onClick={() => setActiveView('settings')}>
            <Settings2 size={17} /> Settings
          </button>
          <button
            className="dashboard-nav-item"
            type="button"
            onClick={() => setIsTutorialOpen(true)}
          >
            <BookOpen size={17} /> Tutorial
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-info-card">
            <span className="workspace-info-icon"><Check size={15} /></span>
            <strong>Workspace connected</strong>
            <p>Your forms and responses are synced to your account.</p>
          </div>
          <button className="profile-button" type="button" onClick={() => setActiveView('settings')} aria-label="Open account settings">
            <span className="profile-avatar">{initials}</span>
            <span><strong>{user?.name || 'Account'}</strong><small>Account settings</small></span>
            <Settings2 size={15} />
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeView === 'responses' ? 'Responses' : activeView === 'settings' ? 'Settings' : activeView === 'projects' ? 'Projects' : activeView === 'webhooks' ? 'Webhooks' : activeView === 'forms' ? 'Forms' : 'Overview'}</strong></div>
          <div className="topbar-actions">
            <span className="live-pill"><span /> Live data</span>
            <button
              className="icon-button"
              type="button"
              aria-label="View new responses"
              title="View responses"
              onClick={() => {
                setSelectedResponseFormId('');
                setActiveView('responses');
              }}
            >
              <Bell size={18} />
            </button>
            <button className="topbar-avatar" type="button" onClick={() => setActiveView('settings')} aria-label="Open account settings">{initials}</button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <div className="dashboard-eyebrow">{today}</div>
              <h1>{activeView === 'forms' ? 'Your forms' : `Good morning, ${greetingName}`} <span>✳</span></h1>
              <p>{activeView === 'forms' ? 'Manage every form in your workspace.' : 'Here’s what’s happening with your forms today.'}</p>
            </div>
            {['overview', 'forms'].includes(activeView) && <div className="create-form-actions">
              <button
                className="create-form-button"
                type="button"
                onClick={() => selectedProject ? onCreateForm(selectedProject) : setActiveView('projects')}
                disabled={isLoading || loadError || !selectedProject}
              >
                <Plus size={17} /> Create a form
              </button>
            </div>}
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

          {activeView === 'projects' ? (
            <ProjectsPanel
              accessToken={accessToken}
              projects={projects}
              onProjectCreated={(project) => {
                setProjects((currentProjects) => [project, ...currentProjects]);
                setSelectedProjectId(project.id);
              }}
              onProjectUpdated={(updatedProject) => setProjects((currentProjects) => currentProjects.map((project) => (
                project.id === updatedProject.id ? updatedProject : project
              )))}
              onProjectDeleted={(projectId) => {
                setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
                setForms((currentForms) => currentForms.filter((form) => form.projectId !== projectId));
              }}
            />
          ) : activeView === 'webhooks' ? (
            <WebhooksPanel accessToken={accessToken} projects={projects} />
          ) : activeView === 'responses' ? (
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
          {activeView === 'overview' && <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-card-top"><span>Total responses</span><span className="stat-icon green"><Inbox size={17} /></span></div>
              <div className="stat-value">{isLoading || loadError ? '—' : totalResponses}</div>
              <div className="stat-foot"><span>Across your workspace</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Active forms</span><span className="stat-icon lavender"><FileText size={17} /></span></div>
              <div className="stat-value">{isLoading || loadError ? '—' : forms.filter((form) => form.status === 'Active').length}</div>
              <div className="stat-foot"><span>Across your workspace</span></div>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span>Workspace projects</span><span className="stat-icon peach"><Activity size={17} /></span></div>
              <div className="stat-value">{isLoading || loadError ? '—' : projects.length}</div>
              <div className="stat-foot"><span>Across your account</span></div>
            </article>
          </div>}

          <section className={`forms-section${activeView === 'forms' ? ' all-forms' : ''}`}>
            <div className="section-heading">
              <div><h2>{activeView === 'forms' ? 'All forms' : 'Your forms'}</h2><p>{activeView === 'forms' ? 'Manage every form in your workspace.' : 'A little overview of what you’re collecting.'}</p></div>
              <div className="forms-controls">
                <label className="form-search">
                  <Search size={16} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search forms" aria-label="Search forms" />
                </label>
                <button className="view-all-button" type="button" onClick={() => {
                  setSearch('');
                  setActiveView('forms');
                }}>View all <ArrowUpRight size={15} /></button>
              </div>
            </div>

            <div className="forms-table">
              <div className="forms-table-head"><span>FORM NAME</span><span>RESPONSES</span><span>LAST UPDATED</span><span>STATUS</span><span /></div>
              {isLoading && <div className="empty-forms">Loading your forms...</div>}
              {loadError && <div className="empty-forms">Your forms could not be loaded.</div>}
              {!isLoading && filteredForms.map((form) => (
                <div className="form-list-item" key={form.id}>
                <div className="form-row">
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
                          aria-label={`${selectedFormDetailsId === form.id ? 'Hide' : 'View'} details for ${form.name}`}
                          title="View form details"
                          onClick={() => setSelectedFormDetailsId((currentId) => currentId === form.id ? '' : form.id)}
                        >
                          <Eye size={15} />
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
                {selectedFormDetailsId === form.id && (
                  <FormDetailsPanel
                    key={form.id}
                    accessToken={accessToken}
                    form={form}
                    onRotated={() => setNotice('The form API key was rotated. Update all integrations using the previous key.')}
                  />
                )}
                </div>
              ))}
              {!isLoading && !loadError && filteredForms.length === 0 && (
                <div className="empty-forms">
                  {search ? `No forms match “${search}”.` : 'No forms yet. Create your first form to get started.'}
                </div>
              )}
            </div>
            <div className="table-footnote"><span className="live-dot" /> Showing live data from your workspace</div>
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
  const [builderProject, setBuilderProject] = useState(null);
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
      setMode('login');
    }
  }

  if (page === 'builder') {
    return (
      <FormBuilder
        onBack={() => setPage('dashboard')}
        onSaved={() => setPage('dashboard')}
        accessToken={accessToken}
        project={builderProject}
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
