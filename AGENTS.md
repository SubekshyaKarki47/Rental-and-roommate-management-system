# Project Rules & Style Guidelines

## Separation of HTML and CSS
- **Always keep HTML and CSS in separate files.**
- Never embed `<style>` tags directly inside HTML files or templates.
- Always use dedicated `.css` files (e.g., `styles.css`, `index.css`, or component-level CSS files) and link them using `<link rel="stylesheet" href="...">` or CSS imports.
- When creating web pages, components, or templates, ensure structure (HTML/JSX) and presentation (CSS) remain decoupled in distinct files.
