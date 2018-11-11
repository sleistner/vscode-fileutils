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
