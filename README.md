[![Build Status](https://travis-ci.org/sleistner/vscode-fileutils.svg?branch=master)](https://travis-ci.org/sleistner/vscode-fileutils)
[![Dependency Status](https://david-dm.org/sleistner/vscode-fileutils.svg)](https://david-dm.org/sleistner/vscode-fileutils)
[![Known Vulnerabilities](https://snyk.io/test/github/sleistner/vscode-fileutils/badge.svg)](https://snyk.io/test/github/sleistner/vscode-fileutils) [![Greenkeeper badge](https://badges.greenkeeper.io/sleistner/vscode-fileutils.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# File Utils - Visual Studio Code Extension

A convenient way of creating, duplicating, moving, renaming, deleting files and directories.

> Inspired by [Sidebar Enhancements](https://github.com/titoBouzout/SideBarEnhancements) for Sublime.


# How to use

![demo](images/demo.gif)

## Using the command palette:

* Bring up the command palette, and select "File: ".
* Select one of the commands mentioned below.
* Press [Enter] to confirm, or [Escape] to cancel.

![howto](images/howto.png)

## Note

Nonexistent folders are created automatically.


## Commands

```json
[
    {
        "command": "fileutils.renameFile",
        "category": "File",
        "title": "Rename"
    },
    {
        "command": "fileutils.moveFile",
        "category": "File",
        "title": "Move"
    },
    {
        "command": "fileutils.duplicateFile",
        "category": "File",
        "title": "Duplicate"
    },
    {
        "command": "fileutils.removeFile",
        "category": "File",
        "title": "Delete"
    },
    {
        "command": "fileutils.newFile",
        "category": "File",
        "title": "New File Relative to Current View"
    },
    {
        "command": "fileutils.newFileAtRoot",
        "category": "File",
        "title": "New File Relative to Project Root"
    },
    {
        "command": "fileutils.newFolder",
        "category": "File",
        "title": "New Folder Relative to Current View"
    },
    {
        "command": "fileutils.newFolderAtRoot",
        "category": "File",
        "title": "New Folder Relative to Project Root"
    },
    {
        "command": "fileutils.copyFileName",
        "category": "File",
        "title": "Copy Name Of Active File"
    }
]
```

## Context Menu

```json
{
    "explorer/context": [
        {
            "command": "fileutils.moveFile",
            "group": "edit"
        },
        {
            "command": "fileutils.duplicateFile",
            "group": "edit"
        }
    ],
    "editor/context": [
        {
            "command": "fileutils.moveFile",
            "group": "edit"
        },
        {
            "command": "fileutils.duplicateFile",
            "group": "edit"
        }
    ]
}
```

## Configuration

```json
{
    "fileutils.delete.useTrash": {
        "type": "boolean",
        "default": false,
        "description": "Move file to the recycle bin instead of deleting it permanently."
    },
    "fileutils.delete.confirm": {
        "type": "boolean",
        "default": true,
        "description": "Controls if it should ask for confirmation when deleting a file."
    },
    "fileutils.rename.closeOldTab": {
          "type": "boolean",
          "default": true,
          "description": "Controls whether to close the tab of the renamed file (Will work only if 'Close On File Delete' setting is disabled)"
    },
    "fileutils.move.closeOldTab": {
          "type": "boolean",
          "default": true,
          "description": "Controls whether to close the tab of the moved file (Will work only if 'Close On File Delete' setting is disabled)"
    },
    "fileutils.typeahead.enabled": {
        "type": "boolean",
        "default": true,
        "description": "Controls if directory selector should be shown."
    },
    "fileutils.typeahead.exclude": {
        "type": "object",
        "default": {},
        "description": "Configure glob patterns for excluding files and folders."
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
