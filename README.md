# JX - JSON Template Library

Minimal JSON fetching + templating library. Like HTMX but simpler.

## Setup

```html
<script type="module" src="./jx.js"></script>
```

## HTML (Declarative)

```html
<button jx-get="/api/users" jx-target="#list" jx-template="users">
Load
</button>

<div id="list"></div>

<template id="users">
<ul>
<li jx-each=".">{{ name }} - {{ email }}</li>
</ul>
</template>
```

## JavaScript (Programmatic)

```javascript
import jx from './jx.js';

// Method 1: Bind attributes
jx.bind('#btn', {
url: '/api/users',
target: '#list',
template: 'users'
});

// Method 2: Direct load
jx.load('/api/users', {
target: '#list',
template: 'users'
});
```

## Attributes

| Attr | Use |
|------|-----|
| `jx-get` | GET request URL |
| `jx-post` | POST request URL |
| `jx-target` | CSS selector (where to render) |
| `jx-template` | \<template\> id |
| `jx-each` | Loop: `jx-each="items"` or `jx-each="."` |
| `jx-if` | Show if truthy: `jx-if="premium"` |

## Examples

### Loop
```html
<template jx-template="list">
<li jx-each="items">{{ name }}</li>
</template>
```

### Conditional
```html
<p jx-if="admin">Admin only</p>
```

### Nested
```html
<p>By {{ author.name }}</p>
```

### Attributes
```html
<a href="/user/{{ id }}">{{ name }}</a>
```

## Notes

- `{{ . }}` = current item (for arrays of primitives)
    - `{{ prop.nested }}` = dot notation
    - Falsy values fail `jx-if`
    - Loading/error states use `.jx-loading` and `.jx-error` classes
