# JX

A minimal library for fetching APIs and rendering data into templates, inspired by HTMX.

## Setup

Include the script in your HTML:

```html
<script src="jx.js"></script>
```

## Basic Usage

### HTML Markup

```html
<button jx-get="/api/data" jx-template="item-template">
  Load Data
</button>

<template id="item-template">
  <h2>{{ title }}</h2>
  <p>{{ description }}</p>
</template>
```

Click the button to fetch from `/api/data`, then render using the template. The template is replaced with the rendered content.

## Attributes

| Attribute | Description |
|-----------|-------------|
| `jx-get` | Fetch URL with GET request |
| `jx-post` | Fetch URL with POST request |
| `jx-template` | Template ID to use for rendering |
| `jx-save` | localStorage key to cache the response |
| `jx-each` | Loop over array: `jx-each="items"` |
| `jx-if` | Conditionally show element: `jx-if="isActive"` |

## Template Syntax

Use `{{ path.to.data }}` to interpolate values:

```html
<template id="user-template">
  <h2>{{ user.name }}</h2>
  <p>Email: {{ user.email }}</p>
  
  <ul>
    <li jx-each="items">{{ this.name }}</li>
  </ul>
  
  <div jx-if="user.isAdmin">Admin only content</div>
</template>
```

## JavaScript API

### `JX.json(template, data)`

Render data directly without fetching:

```javascript
JX.json('user-template', { name: 'Alice', email: 'alice@example.com' });
```

### `JX.bind(selector, config)`

Programmatically set up triggers:

```javascript
JX.bind('#load-btn', {
  url: '/api/data',
  template: 'item-template',
  method: 'POST',
  save: 'cached-data'
});
```

### `JX.loadCached(key, template)`

Load previously cached data:

```javascript
JX.loadCached('cached-data', 'item-template');
```

## Example

```html
<button jx-get="/api/posts" jx-template="post-list" jx-save="posts-cache">
  Load Posts
</button>

<template id="post-list">
  <article jx-each=".">
    <h3>{{ title }}</h3>
    <p>{{ excerpt }}</p>
    <small jx-if="featured">Featured</small>
  </article>
</template>

<script>
  // Load from cache if available, otherwise user clicks button
  JX.loadCached('posts-cache', 'post-list');
</script>
```
