export function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
  
  export function handleAfterPrint() {
    document
      .getElementById('jd-print-frame')
      ?.remove();
  }
  
  export async function printExecutiveReport({
    audit,
    reportElement,
    setError
  }) {
  
    if (!audit) {
      setError?.(
        'Run or open an audit before exporting a report.'
      );
      return;
    }
  
    if (!reportElement) {
      setError?.(
        'Executive report not found.'
      );
      return;
    }
  
    const existing =
      document.getElementById(
        'jd-print-frame'
      );
  
    if (existing) {
      existing.remove();
    }
  
    const iframe =
      document.createElement('iframe');
  
    iframe.id = 'jd-print-frame';
  
    Object.assign(
      iframe.style,
      {
        position: 'fixed',
        right: '0',
        bottom: '0',
        width: '1px',
        height: '1px',
        opacity: '0',
        pointerEvents: 'none',
        border: '0'
      }
    );
  
    document.body.appendChild(
      iframe
    );
  
    const frameWindow =
      iframe.contentWindow;
  
    const frameDocument =
      iframe.contentDocument ||
      frameWindow.document;
  
    const styles = Array
      .from(
        document.querySelectorAll(
          'style,link[rel="stylesheet"]'
        )
      )
      .map(x => x.outerHTML)
      .join('\n');
  
    frameDocument.open();
  
    frameDocument.write(`
  <!doctype html>
  
  <html>
  
  <head>
  
  <meta charset="UTF-8">
  
  <title>
  ${escapeHtml(
  audit.deckName ||
  audit.title ||
  'Executive Report'
  )}
  </title>
  
  ${styles}
  
  <style>
  
  @page{
  
  size:A4;
  
  margin:12mm;
  
  }
  
  html,
  body{
  
  margin:0;
  
  background:white;
  
  color:#111827;
  
  font-family:
  Inter,
  Arial,
  sans-serif;
  
  }
  
  button,
  .no-print{
  
  display:none!important;
  
  }
  
  </style>
  
  </head>
  
  <body>
  
  ${reportElement.outerHTML}
  
  </body>
  
  </html>
  `);
  
    frameDocument.close();
  
    if (frameDocument.fonts?.ready) {
      await frameDocument.fonts.ready;
    }
  
    await new Promise(resolve =>
      setTimeout(resolve,700)
    );
  
    frameWindow.focus();
  
    frameWindow.print();
  
    setTimeout(() => {
      iframe.remove();
    },60000);
  
  }