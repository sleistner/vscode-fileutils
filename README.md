![icon](images/icon-96x96.png)

# File Utils - Visual Studio Code Extension

[![Build Status](https://travis-ci.org/sleistner/vscode-fileutils.svg?branch=master)](https://travis-ci.org/sleistner/vscode-fileutils)
[![Dependency Status](https://david-dm.org/sleistner/vscode-fileutils.svg)](https://david-dm.org/sleistner/vscode-fileutils)
[![Known Vulnerabilities](https://snyk.io/test/github/sleistner/vscode-fileutils/badge.svg)](https://snyk.io/test/github/sleistner/vscode-fileutils)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


---


A convenient way of creating, duplicating, moving, renaming, deleting files and directories.

_Inspired by [Sidebar Enhancements](https://github.com/titoBouzout/SideBarEnhancements) for Sublime._


# How to use

![demo](images/demo.gif)

## Using the command palette:

* Bring up the command palette, and select "File Utils: ".
* Select one of the commands mentioned below.
* Press [Enter] to confirm, or [Escape] to cancel.

![howto](images/howto.png)

## Note

Non-existent folders are created automatically.


## Commands

```json
[
    {
        "command": "fileutils.renameFile",
        "category": "File Utils",
        "title": "Rename"
    },
    {
        "command": "fileutils.moveFile",
        "category": "File Utils",
        "title": "Move"
    },
    {
        "command": "fileutils.duplicateFile",
        "category": "File Utils",
        "title": "Duplicate"
    },
    {
        "command": "fileutils.removeFile",
        "category": "File Utils",
        "title": "Delete"
    },
    {
        "command": "fileutils.newFile",
        "category": "File Utils",
        "title": "New File Relative to Current View"
    },
    {
        "command": "fileutils.newFileAtRoot",
        "category": "File Utils",
        "title": "New File Relative to Project Root"
    },
    {
        "command": "fileutils.newFolder",
        "category": "File Utils",
        "title": "New Folder Relative to Current View"
    },
    {
        "command": "fileutils.newFolderAtRoot",
        "category": "File Utils",
        "title": "New Folder Relative to Project Root"
    },
    {
        "command": "fileutils.copyFileName",
        "category": "File Utils",
        "title": "Copy Name Of Active File"
    }
]
```

## Configuration

```json
{
    "fileutils.typeahead.enabled": {
        "type": "boolean",
        "default": true,
        "description": "Controls if directory selector should be shown."
    }
}
```

# Changelog

- [https://github.com/sleistner/vscode-fileutils/blob/master/CHANGELOG.md](https://github.com/sleistner/vscode-fileutils/blob/master/CHANGELOG.md)

# How to contribute

- [https://github.com/sleistner/vscode-fileutils/blob/master/CONTRIBUTING.md](https://github.com/sleistner/vscode-fileutils/blob/master/CONTRIBUTING.md)

# Disclaimer

**Important:** This extension due to the nature of it's purpose will create
files on your hard drive and if necessary create the respective folder structure.
While it should not override any files during this process, I'm not giving any guarantees
or take any responsibility in case of lost data.

# Contributors

* [Steffen Leistner](https://github.com/sleistner)
* [Ilia Shkolyar](https://github.com/iliashkolyar)

# License

MIT

# Credits

## Icon
- [Janosch, Green Tropical Waters - Utilities Icon](https://iconarchive.com/show/tropical-waters-folders-icons-by-janosch500/Utilities-icon.html)
