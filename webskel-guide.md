# WebSkel Framework Guide

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
    - [Project Structure](#project-structure)
    - [Initialization](#initialization)
3. [Core Concepts](#3-core-concepts)
    - [Configuration](#configuration)
    - [Components](#components)
    - [Presenters](#presenters)
    - [Templating](#templating)
4. [Advanced Features](#4-advanced-features)
    - [Modals](#modals)
    - [Services](#services)
    - [Routing](#routing)
5. [Best Practices](#5-best-practices)
    - [Component Structure](#component-structure)
    - [State Management](#state-management)
    - [Error Handling](#error-handling)
    - [Performance](#performance)
    - [Audio Playback](#best-practices-for-audio-playback)
6. [AI Agent Development Prompt](#6-ai-agent-development-prompt)
7. [Troubleshooting](#7-troubleshooting)

## 1. Introduction

WebSkel is a lightweight, configuration-driven JavaScript framework for building single-page applications (SPAs). It
leverages standard Web Components to create encapsulated and reusable UI elements. The framework emphasizes separation
of concerns, clean architecture, and developer productivity.

## 2. Getting Started

### Project Structure

```
my-app/
├── web-components/          # All UI components
│   ├── pages/              # Page components
│   │   └── home/
│   │       ├── home.html
│   │       ├── home.css
│   │       └── home.js
│   ├── components/         # Reusable components
│   └── modals/             # Modal dialogs
├── services/               # Business logic services
│   ├── ApiService.js
│   └── AuthService.js
├── assets/                 # Static assets
│   ├── images/
│   └── styles/
├── webskel-configs.json    # Framework configuration
└── index.html              # Entry point
```

### Initialization

1. **HTML Entry Point** (`index.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My WebSkel App</title>
    <link rel="stylesheet" href="/assets/styles/main.css">
</head><body>
    <!-- Main application container -->
    <div id="app"></div>
    
    <!-- Loading indicator (shown during initialization) -->
    <dialog id="before_webskel_loader" class="spinner" open>
        <div class="spinner-container">
            <div class="spin"></div>
            <p>Loading application...</p>
        </div>
    </dialog>

    <!-- Application entry point -->
    <script src="/app.js" type="module"></script>
</body>
</html>
```

2. **JavaScript Entry Point** (`app.js`):

```javascript
import WebSkel from './WebSkel/webskel.mjs';

async function bootstrap() {
    try {
        // Initialize framework with config
        const webSkel = await WebSkel.initialise('webskel-configs.json');
        
        // Set the root DOM element for pages
        webSkel.setDomElementForPages(document.querySelector('#app'));
        
        // Navigate to default page
        await webSkel.changeToDynamicPage(
            webSkel.configs.defaultPage, 
            webSkel.configs.defaultPage
        );
        
        // Hide loading indicator
        document.getElementById('before_webskel_loader').remove();
        
        // Make WebSkel instance globally available
        window.webSkel = webSkel;
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show error to user
        document.getElementById('before_webskel_loader').innerHTML = 
            '<div class="error">Failed to load application. Please refresh the page.</div>';
    }
}

// Start the application
bootstrap();
```

## 3. Core Concepts

### Configuration

The `webskel-configs.json` file is the central configuration for your application. It defines all components, services,
and application settings.

```json
{
    "name": "my-app",
    "version": "1.0.0",
    "defaultPage": "home",
    "components": [
        {
            "name": "home",
            "type": "pages",
            "presenterClassName": "HomePage"
        },
        {
            "name": "user-profile",
            "type": "components",
            "presenterClassName": "UserProfile"
        },
        {
            "name": "confirm-dialog",
            "type": "modals",
            "presenterClassName": "ConfirmDialog"
        }
    ],
    "services": [
        {
            "name": "ApiService",
            "path": "../services/ApiService.js"
        }
    ],
    "webComponentsRootDir": "web-components",
    "defaultPage": "home"
}
```

### Components

Components are the building blocks of your application. All components are placed under `webComponentsRootDir`.
Each component consists of:

1. **HTML Template** (`component-name.html`)
2. **CSS Styles** (`component-name.css`)
3. **Presenter** (`component-name.js`)

### Presenters

Presenters handle the business logic for components. They have access to:

- `this.element`: The component's root DOM element
- `this.invalidate`: A function to trigger a re-render
- `window.webSkel`: The global framework instance

### Templating

WebSkel's templating engine uses `$$variable` placeholders for one-way data binding. It does **not** evaluate JavaScript
expressions; all logic must be handled within the presenter.

## 4. Advanced Features

### Modals

Show a modal dialog and wait for its result:

```javascript
async function showConfirmation() {
    const result = await window.webSkel.showModal('confirm-dialog', {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?'
    }, true); // 'true' waits for the modal to close.

    if (result) {
        console.log("User confirmed with data:", result);
    } else {
        console.log("User cancelled.");
    }
}
```

### Services

Services are singleton classes for application-level logic (e.g., API calls). Register them in `webskel-configs.json`
and access them via `window.webSkel.appServices`.

### Routing

Navigate between pages programmatically:

```javascript
await window.webSkel.changeToDynamicPage('products', '/products', { category: 'all' });
```

## 5. Best Practices

- **Component Structure:** Keep components small and focused.
- **State Management:** Use services for shared state.
- **Error Handling:** Use the built-in error modals for user-facing errors.
- **Performance:** Lazy load non-critical components.

### Best Practices for Audio Playback

Handling audio in web applications can be tricky. A common issue is an `<audio>` element reporting its `duration` as
`Infinity`.

#### The "Infinity Duration" Problem

This issue occurs for two main reasons:

1. **Missing `Content-Length` Header:** The primary cause. If the server serving the audio file (e.g., a `.wav` or
   `.mp3`) does not include the `Content-Length` HTTP header, the browser treats the audio as a live stream of unknown
   length, causing the `duration` property to default to `Infinity`.
2. **Race Condition:** Accessing the `duration` property immediately after setting the `.src` of an audio element will
   fail because it takes time for the browser to load and process the file's metadata.

#### The Solution: Awaiting Playback with Promises

To reliably play audio and get its correct duration, you must use a `Promise` that resolves after the audio has loaded
and finished playing. The following function is the standard, recommended way to handle audio playback in WebSkel.

**Standard Audio Playback Function:**

```javascript
/**
 * Plays an audio source and returns a Promise that resolves with the audio's duration in milliseconds.
 * This function correctly handles audio loading and playback completion.
 *
 * @param {HTMLAudioElement} audio - The <audio> element to use for playback.
 * @param {string} audioUrl - The URL or Blob URL of the audio file to play.
 * @returns {Promise<number>} A promise that resolves with the duration of the audio in milliseconds.
 */
function playAudio(audio, audioUrl) {
    if (!audioUrl) {
        return Promise.resolve(0); // No audio, resolve immediately with 0 duration.
    }

    return new Promise((resolve, reject) => {
        audio.src = audioUrl;

        const onCanPlay = () => {
            audio.play().catch(e => {
                console.error("Audio playback failed:", e);
                cleanupAndReject(e);
            });
        };

        const onEnded = () => {
            // Ensure duration is a valid number before resolving.
            const duration = isFinite(audio.duration) ? audio.duration * 1000 : 0;
            cleanupAndResolve(duration);
        };

        const onError = (e) => {
            console.error("Error with audio element:", e);
            cleanupAndReject(new Error("Failed to play audio"));
        };

        const cleanupAndResolve = (value) => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            resolve(value);
        };

        const cleanupAndReject = (err) => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            reject(err);
        };

        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });

        audio.load();
    });
}
```

**How to Use It in a Presenter:**

```javascript
// In your presenter (e.g., meme-preview.js)
async _playCurrentScene() {
    // ... render scene logic ...
    const audioUrl = this.ttsAudioMap.get(this.currentSceneIndex);

    // Await the playback to get the actual duration
    const ttsDurationMs = await playAudio(this.ttsAudioElement, audioUrl);
    const sceneDurationMs = this.script.scenes[this.currentSceneIndex].duration || 0;

    // The scene should last for the duration of the audio or the scene's own duration, whichever is longer.
    const totalDurationMs = Math.max(sceneDurationMs, ttsDurationMs);

    this.timeoutId = setTimeout(() => {
        // ... go to next scene ...
    }, totalDurationMs);
}
```

## 6. AI Agent Development Prompt

```text
**Your Role:** You are an expert software engineering assistant specializing in front-end application development using
the WebSkel framework. Your task is to write, modify, and debug WebSkel code, strictly adhering to its architecture and
conventions.

**1. WebSkel Framework Overview**

WebSkel is a JavaScript micro-framework, based on Web Components, for creating Single Page Applications (SPAs). It
follows the Model-View-Presenter (MVP) pattern and is configuration-driven.

* **View:** Simple HTML files that use the `$$variable` syntax for data binding. User interactions are defined
  declaratively using `data-local-action` attributes.
* **Presenter:** A JavaScript class that contains all the logic for a component. It manages state, events, and data.
* **Configuration:** A central `webskel-configs.json` file defines all components, routes, and services of the
  application.

**2. Core Concepts**

* **`webskel-configs.json`**: This is the application manifest. Any new component must be declared here.
* **Component Structure**: Each component consists of 3 files in its own directory (e.g.,
  `/web-components/pages/my-component/`):
    1. `my-component.html`: The HTML structure.
    2. `my-component.css`: Component-specific CSS styles.
    3. `my-component.js`: The logic (Presenter class).
* **Data Binding**: Use `$$variableName` in the HTML. These variables are automatically populated from the properties of
  the Presenter class.
* **Re-rendering**: Calling the `this.invalidate()` function inside a presenter triggers a new rendering cycle for that
  component.

**3. Development Workflow: Creating a New Component**

1. **Declare in `webskel-configs.json`**: Add a new object to the `components` array.
2. **Create the Files**: Create the `.html`, `.css`, and `.js` files for the component.
3. **Implement the Presenter**: Write the logic in the presenter class.

**4. Key API and Conventions**

* **Global Access**: Use `window.webSkel` to access the framework instance.
* **Components**: pages, components, and modals are all components. And are stored in the `web-components` directory
  defined in `webskel-configs.json` under the `webComponentsRootDir` property or the `rootDir` absolute path.
* **Navigation**: `await window.webSkel.changeToDynamicPage("page-name", "url-hash");`
* **Local Actions (`data-local-action`)**: Binds an element to a method in its presenter. Example:
  `<button data-local-action="saveSettings">` calls `this.saveSettings()`.
* **Modals**: `const result = await window.webSkel.showModal("modal-name", { prop1: "value" }, true);` last parameter is
  `true` to wait for modal result.
* **Services**: Access services via `window.webSkel.appServices`.
* **Loading Indicators**: Use `window.webSkel.showLoading()` and `window.webSkel.hideLoading()`.
* **Error Handling**: Use `await window.webSkel.showModal("show-error-modal", { ... });`
```

## 7. Troubleshooting

- **Component not loading:** Check `webskel-configs.json`, file paths, and the browser console.
- **Data not updating:** Ensure you are calling `this.invalidate()` after changing presenter properties.
- **Styling issues:** Check for CSS specificity conflicts.
