## 2.8.1 (2018-02-25)

### Fixes

- Extension can not be loaded due to missing dependency.

## 2.8.0 (2018-02-25)

### Features

- `File: Delete`, Add configuration `fileutils.delet.useTrash` in order to move files to trash.
- `File: Delete`, Add configuration `fileutils.delet.confirm` to toggle confirmation dialog.

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
