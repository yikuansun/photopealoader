# photopealoader
Desktop app version of [Photopea](https://github.com/photopea/photopea) that loads config file, resources, and plugins from local machine, and can handle Open With.

Please note that this app does run online.

## Usage
### Open a file
You can use File > Open within the app, or you can find the file on your machine and use Open With.
### Custom config
A folder at `Documents/Photopea files` will be created on your device once the app is opened. Inside, there will be a `config.json` file. You can fill it with the [JSON configuration object](https://www.photopea.com/api/). Once the file has been saved, the app will use it the next time it is started.
### Resources
Drag custom brush, style, action, and other files into the folder at `Documents/Photopea files/Resources`. These files will be loaded into Photopea the next time the app is started.
### [Plugins](https://www.photopea.com/api/plugins)
For each plugin, create a JSON file formatted as such:
```
{
    "name"  : "[name of the plugin]",
    "url"   : "[plugin URL]",
    "width" : [default width],
    "height": [default height],
    "icon"  : "[URL of the icon]"
}
```
Place these JSON files into the `Documents/Photopea files/Plugins` floder. The plugins will be loaded into Photopea the next time the app is started.
