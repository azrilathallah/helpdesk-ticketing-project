/**
 * Reusable UI Components
 * Consolidated from separate Alert, Button, and Input files
 */

export function Alert({ type = 'error', children }) {
  const styles = {
    error:   'alert alert--error',
    success: 'alert alert--success',
    info:    'alert alert--info',
  };

  return (
    <div className={styles[type]}>
      {children}
    </div>
  );
}

export function Button({ children, loading, variant = 'danger', className = '', ...props }) {
  return (
    <button
      className={`btn btn--${variant} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="btn__loader">
          <svg className="btn__spinner" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
          </svg>
          Processing...
        </span>
      ) : children}
    </button>
  );
}

export function Input({ label, id, error, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? 'form-input--error' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
