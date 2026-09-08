# Code Structure Guidelines

## Separation of HTML and CSS
- **Separate HTML and CSS files**: HTML markup and CSS styles must always be maintained in separate files.
- Do not embed inline `<style>` blocks inside `.html` files.
- Always create dedicated `.css` stylesheets and link them via `<link rel="stylesheet" href="...">` or CSS module imports.
- Maintain clean, decoupled file organization between structure (HTML) and styles (CSS).
