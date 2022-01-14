![icon](images/icon-96x96.png)

# File Utils - Visual Studio Code Extension

[![CI/CD](https://github.com/sleistner/vscode-fileutils/actions/workflows/main.yml/badge.svg)](https://github.com/sleistner/vscode-fileutils/actions/workflows/main.yml)
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

## Brace Expansion
> Brace expansion is a mechanism by which arbitrary strings may be generated.

Example file name input
```bash
/tmp/{a,b,c}/index.{cpp,ts,scss}
```

will generate the following files
```bash
➜  tree /tmp
/tmp
├── a
│   ├── index.cpp
│   ├── index.scss
│   └── index.ts
├── b
│   ├── index.cpp
│   ├── index.scss
│   └── index.ts
└── c
    ├── index.cpp
    ├── index.scss
    └── index.ts
```

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
