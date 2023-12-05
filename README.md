# WebSkel

WebSkel is a JavaScript-based framework designed to facilitate the development of web applications. It provides a set of utilities and services that help developers to manage and control the behavior of their applications.

## Features

- **Presenter Registry**: WebSkel maintains a registry of presenters, which are responsible for controlling the behavior of the application's components.

- **Service Registry**: WebSkel also maintains a registry of services, which are used to perform various operations within the application.

- **Action Registry**: WebSkel provides a mechanism for registering actions, which can be invoked in response to user interactions.

- **Dynamic Page Loading**: WebSkel supports the dynamic loading of pages, allowing the application to update its content without requiring a full page reload.

- **Custom HTML Elements**: WebSkel provides a mechanism for defining custom HTML elements, which can be used to create complex UI components.

- **Storage Manager**: WebSkel includes a storage manager, which provides a unified interface for interacting with various storage services.

## Usage

To use WebSkel in your project, you need to import it and create a new instance:

```javascript
import { WebSkel } from "./imports.js";

window.webSkel = new WebSkel();
```

You can then use the `webSkel` instance to interact with the framework's features. For example, you can register a new presenter like this:

```javascript
webSkel.registerPresenter("myPresenter", myPresenterInstance);
```

Or you can change the current page like this:

```javascript
webSkel.changeToDynamicPage("myPage");
```

## Configuration

WebSkel can be configured by loading a JSON file that specifies the paths to the presenters, services, and components that should be used by the application. Here is an example of what this configuration file might look like:

```json
{
    "presenters": [
        {
            "name": "myPresenter",
            "className": "MyPresenter",
            "path": "./path/to/myPresenter.js"
        }
    ],
    "services": [
        {
            "name": "myService",
            "path": "./path/to/myService.js"
        }
    ],
    "components": [
        {
            "name": "myComponent",
            "path": "./path/to/myComponent.html",
            "cssPaths": ["./path/to/myComponent.css"]
        }
    ]
}
```

This configuration file can be loaded like this:

```javascript
await loadConfigs("./path/to/configs.json");
```

## Dependencies

WebSkel is built with JavaScript and is intended to be used in a browser environment. It does not have any external dependencies.

## Contributing

Contributions to WebSkel are welcome. Please submit a pull request with your changes.

## License

WebSkel is licensed under the MIT License.