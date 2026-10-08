export default function ErrorMessage({
  message,
  onRetry
}) {

  if (
    !message ||
    (typeof message === "string" &&
      (message.includes("<!DOCTYPE") ||
        message.includes("<html") ||
        message.includes("ImproperlyConfigured") ||
        message.includes("Traceback") ||
        message.includes("DATABASES")))
  ) {
    return null;
  }

  return (
    <div
      className="error-box"
      role="alert"
    >
      <span>
        {message}
      </span>

      {onRetry && (

        <button
          className="btn btn-small"
          onClick={onRetry}
        >
          Try Again
        </button>

      )}

    </div>
  );
}