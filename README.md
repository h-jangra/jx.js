# JX — Minimal JSON → Template Renderer

**JX** is a tiny declarative templating helper for HTML.
It binds elements to URLs using `jx-get` / `jx-post`, fetches JSON, and renders it into native `<template>` elements with `{{ bindings }}`, loops, conditionals, and optional caching.

No build tools. No dependencies. Just drop it in.

---

## Features

* Use `<template>` with `{{ variable }}` bindings
* Auto-fetch on click via `jx-get` / `jx-post`
* Loops with `jx-each="items"`
* Conditionals with `jx-if="condition"`
* Attribute interpolation (`src="{{ url }}"`)
* Optional localStorage caching (`jx-save="key"`)
* Minimal API for manual loading

---

## Basic Usage

### 1. Add a Template

```html
<template id="user-template">
  <div>
    <h3>{{ name }}</h3>
    <p>{{ email }}</p>
  </div>
</template>
```

### 2. Add a Trigger

```html
<button jx-get="/api/user" jx-template="user-template">
  Load User
</button>
```

### 3. Include JX

```html
<script src="jx.js"></script>
```

Clicking the button fetches JSON and replaces the `<template>` with rendered HTML.

---

## Looping

```html
<template id="list">
  <ul>
    <li jx-each="items">{{ name }}</li>
  </ul>
</template>
```

---

## Conditionals

```html
<div jx-if="isAdmin">Admin Panel</div>
```

---

## Saving + Loading Cached Data

```html
<button
  jx-get="/api/dashboard"
  jx-template="dash"
  jx-save="dashboard-cache">
  Load Dashboard
</button>
```

Load from cache manually:

```js
JX.loadCached("dashboard-cache", "dash");
```

---

## Programmatic Binding

```js
JX.bind("#btn", {
  url: "/api/profile",
  template: "profile",
  method: "GET",
  save: "profile-cache"
});
```

Trigger immediately:

```js
JX.load("#btn", {
  url: "/api/profile",
  template: "profile"
});
```

---

## Manual Rendering

```js
JX.json("user-template", { name: "Ava", email: "a@example.com" });
```

---

## Attributes Reference

| Attribute     | Purpose                    |
| ------------- | -------------------------- |
| `jx-get`      | Fetch with GET             |
| `jx-post`     | Fetch with POST            |
| `jx-template` | Template ID to render      |
| `jx-save`     | Saves JSON to localStorage |
| `jx-each`     | Loop over an array         |
| `jx-if`       | Conditional rendering      |

---

## Example JSON

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "items": [
    { "name": "Item A" },
    { "name": "Item B" }
  ]
}
```

