
# JSONX

JSONX is a lightweight JavaScript library for progressive enhancement using JSON APIs. Similar to htmx, but instead of HTML fragments, it uses JSON data and templates.

## Features
- Attribute-based and object-based API
- `<template>` support
- Variables, loops (`{{#items}}...{{/items}}`), conditionals (`{{#if condition}}...{{/if}}`)
- Loading and error states
- Custom events: `jx:loading`, `jx:success`, `jx:error`

## Installation
```bash
npm install jsonx
```

## Usage
```html
<button id="loadUsers">Load Users</button>
<div id="user-list"></div>

<template id="user-template">
  <h2>User List</h2>
  {{#users}}
    <div class="user">
      <p>Name: {{name}}</p>
      <p>Email: {{email}}</p>
      {{#if isActive}}<span class="active">Active</span>{{/if}}
    </div>
  {{/users}}
</template>

<script type="module">
  import jsonx from './jsonx.js';
  jsonx.bind({
    element: "#loadUsers",
    get: "/api/users",
    target: "#user-list",
    template: "#user-template",
    trigger: "click"
  });
</script>
```
