## [3.0.1](https://github.com/sleistner/vscode-fileutils/compare/v3.0.0...v3.0.1) (2020-01-15)


### Bug Fixes

* **FileItem:** ensure file exists before deleting it ([7a44326](https://github.com/sleistner/vscode-fileutils/commit/7a44326))

# [3.0.0](https://github.com/sleistner/vscode-fileutils/compare/v2.14.9...v3.0.0) (2019-09-03)


### Bug Fixes

* **TreeWalker:** handle large directory structures safely ([c419c78](https://github.com/sleistner/vscode-fileutils/commit/c419c78))


### BREAKING CHANGES

* **TreeWalker:** The configuration option "typeahead.exclude" has been
removed in favour of VS Code native "files.exclude" option.

## [2.14.9](https://github.com/sleistner/vscode-fileutils/compare/v2.14.8...v2.14.9) (2019-08-26)


### Bug Fixes

* **RemoveFileCommand:** ensure only delete file tab was closed ([557e794](https://github.com/sleistner/vscode-fileutils/commit/557e794))

## [2.14.8](https://github.com/sleistner/vscode-fileutils/compare/v2.14.7...v2.14.8) (2019-08-26)


### Bug Fixes

* **NewFileCommand:** show quickpick on large directory structures ([8c8c537](https://github.com/sleistner/vscode-fileutils/commit/8c8c537))

## [2.14.7](https://github.com/sleistner/vscode-fileutils/compare/v2.14.6...v2.14.7) (2019-08-23)


### Bug Fixes

* **NewFileCommand:** show folder selector ([38fb33f](https://github.com/sleistner/vscode-fileutils/commit/38fb33f))

## [2.14.6](https://github.com/sleistner/vscode-fileutils/compare/v2.14.5...v2.14.6) (2019-08-20)


### Bug Fixes

* missing callback in remote environments ([63ef29a](https://github.com/sleistner/vscode-fileutils/commit/63ef29a))

## [2.14.5](https://github.com/sleistner/vscode-fileutils/compare/v2.14.4...v2.14.5) (2019-06-03)


### Bug Fixes

* **CopyFileName:** forward and process tab uri ([68ae985](https://github.com/sleistner/vscode-fileutils/commit/68ae985))

## [2.14.4](https://github.com/sleistner/vscode-fileutils/compare/v2.14.3...v2.14.4) (2019-05-29)


### Bug Fixes

* **FileItem:** update trash import ([850dfff](https://github.com/sleistner/vscode-fileutils/commit/850dfff))
* **package:** update trash to version 5.0.0 ([51f7017](https://github.com/sleistner/vscode-fileutils/commit/51f7017))

## [2.14.3](https://github.com/sleistner/vscode-fileutils/compare/v2.14.2...v2.14.3) (2019-05-29)


### Bug Fixes

* **contribution:** reorder conext menu items ([2883402](https://github.com/sleistner/vscode-fileutils/commit/2883402))

## [2.14.2](https://github.com/sleistner/vscode-fileutils/compare/v2.14.1...v2.14.2) (2019-05-29)


### Bug Fixes

* **package:** update fs-extra to version 8.0.0 ([86ff0b9](https://github.com/sleistner/vscode-fileutils/commit/86ff0b9))

## [2.14.1](https://github.com/sleistner/vscode-fileutils/compare/v2.14.0...v2.14.1) (2019-05-29)


### Bug Fixes

* icon position ([a273e32](https://github.com/sleistner/vscode-fileutils/commit/a273e32))

# [2.14.0](https://github.com/sleistner/vscode-fileutils/compare/v2.13.7...v2.14.0) (2019-05-29)


### Features

* **editor/title/context:** add rename, remove and copy command ([bb0482e](https://github.com/sleistner/vscode-fileutils/commit/bb0482e))

## [2.13.7](https://github.com/sleistner/vscode-fileutils/compare/v2.13.6...v2.13.7) (2019-04-20)


### Bug Fixes

* icon color ([21f4eb4](https://github.com/sleistner/vscode-fileutils/commit/21f4eb4))

## [2.13.6](https://github.com/sleistner/vscode-fileutils/compare/v2.13.5...v2.13.6) (2019-04-20)


### Bug Fixes

* **NewFileCommand:** prompt to select workspace ([8335975](https://github.com/sleistner/vscode-fileutils/commit/8335975))

## [2.13.4](https://github.com/sleistner/vscode-fileutils/compare/v2.13.3...v2.13.4) (2019-01-03)


### Bug Fixes

* **README:** remove unsupported category ([4a13e08](https://github.com/sleistner/vscode-fileutils/commit/4a13e08))

## [2.13.3](https://github.com/sleistner/vscode-fileutils/compare/v2.13.2...v2.13.3) (2018-11-11)


### Bug Fixes

* **releaserc:** enable release notes plugin ([b88a7c6](https://github.com/sleistner/vscode-fileutils/commit/b88a7c6))
* **releaserc:** enable release notes plugin ([eabac50](https://github.com/sleistner/vscode-fileutils/commit/eabac50))

## 2.13.0 (2018-11-10)

### Features
- `File: Rename`
- `File: Move`
[iliashkolyar](https://github.com/iliashkolyar) Add configuration to support whether to close old tabs [PR#67](https://github.com/sleistner/vscode-fileutils/pull/67)

## 2.12.0 (2018-11-02)

### Fixes

- [iliashkolyar](https://github.com/iliashkolyar) Support file operations on non-textual files [PR#63](https://github.com/sleistner/vscode-fileutils/pull/63)

### Features

- `File: Copy Name Of Active File` [iliashkolyar](https://github.com/iliashkolyar) Support copy name of active file [PR#61](https://github.com/sleistner/vscode-fileutils/pull/61)

## 2.10.3 (2018-06-15)

### Fixes

- `File: New File`, Show quick pick view only if more than 1 choice available.

## 2.10.0 (2018-06-14)

### Features

- `File: New File`, Autocomplete paths when creating a new file.
[PR#48](https://github.com/sleistner/vscode-fileutils/pull/48)
Inspired and heavily borrowed from [https://github.com/patbenatar/vscode-advanced-new-file](https://github.com/patbenatar/vscode-advanced-new-file)

## 2.9.0 (2018-05-24)

### Features

- `File: New File`, Adding a trailing / to the supplied target name causes the creation of a new directory.
[PR#25](https://github.com/sleistner/vscode-fileutils/pull/25)

## 2.8.1 (2018-02-25)

### Fixes

- Extension can not be loaded due to missing dependency.

## 2.8.0 (2018-02-25)

### Features

- `File: Delete`, Add configuration `fileutils.delete.useTrash` in order to move files to trash.
- `File: Delete`, Add configuration `fileutils.delete.confirm` to toggle confirmation dialog.

## 2.7.1 (2017-10-25)

### Fixes:

- Renaming and other actions move editor to first group

## 2.7.0 (2017-10-05)

### Features:

 - [lazyc97](https://github.com/lazyc97) Select filename when inputbox shows up [PR#23](https://github.com/sleistner/vscode-fileutils/pull/23)

## 2.6.1 (2017-06-12)

### Fixes:

 - Keyboard shortcuts failed to execute

## 2.4.1 (2017-03-06)

### Features:

 - Enable modal confirmation dialogs

## 2.3.4 (2017-03-06)

### Fixes:

 - File-New File or Folder failed to execute

## 2.3.3 (2017-01-12)

### Fixes:

 - File-Duplicate from the context menu doesn't work on Windows

## 2.3.1 (2016-10-14)

### Features:

  - file browser context menu

        Duplicate

  - file editor context menu

        Duplicate

  - file editor context menu

        Move

## 2.0.0 (2016-07-18)

### Features:

  - file browser context menu

        Move

    Moves the selected file or directory.

    _(Also creates nested directories)_

### Breaking Changes:

  - command prefix `extensions` has been renamed to `fileutils`

## 1.1.0 (2016-05-04)

### Features:

  - command

        File: New File Relative to Current View

    Adds a new file relative to file open in active editor.

    _(Also creates nested directories)_

  - command

        File: New File Relative to Project Root

    Adds a new file relative to project root.

    _(Also creates nested directories)_

  - command

        File: New Folder Relative to Current View

    Adds a new directory relative to file open in active editor.

    _(Also creates nested directories)_

  - command

        File: New Folder Relative to Project Root

    Adds a new directory relative to project root.

    _(Also creates nested directories)_

## 1.0.0 (2016-05-03)

Features:

  - command

        File: Rename

    Renames the file open in active editor.

    _(Also creates nested directories)_

  - command

        File: Move

    Moves the file open in active editor.

    _(Also creates nested directories)_

  - command

        File: Duplicate

    Duplicates the file open in active editor.

    _(Also creates nested directories)_

  - command

        File: Remove

    Deletes the file open in active editor.
