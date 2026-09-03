const sanitize = (html, options) => {
  if (typeof html !== 'string') return html;
  
  // Basic mock for DOMPurify sanitization
  let sanitized = html
    .replace(/(javascript|data|vbscript):/gi, 'blocked:')
    .replace(/on\w+=/gi, 'blocked=');

  if (options && options.ALLOWED_TAGS && options.ALLOWED_TAGS.length === 0) {
    // Strip all tags, keeping content
    return sanitized.replace(/<[^>]+>/gm, '');
  }
  
  // Simple encode for HTML to pass tests expecting &lt; and &quot;
  return sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

module.exports = {
  __esModule: true,
  default: { sanitize },
  sanitize,
};
