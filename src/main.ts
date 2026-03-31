import { Plugin, WorkspaceLeaf, TFile, Notice } from "obsidian";

/* extended WorkspaceLeaf because 'tabHeaderEl' and 'tabHeaderInnerTitleEl' practically exist but they are not in type definition file */
declare module "obsidian" {
  interface WorkspaceLeaf {
    tabHeaderEl: HTMLElement;
    tabHeaderInnerTitleEl: HTMLElement;
  }
}

export default class CloseDuplicatesPlugin extends Plugin {
  commands = {
    close_only_duplicates: "Close only duplicates",
    close_all_duplicates: "Close all duplicates",
  };

  duplicateIcon = "copy-x";
  highlightCssClassNamePrefix = "duplicate-group-";

  async onload() {
    this.addContextMenuCommands();
    this.addHighlightDuplicatesHandling();
  }

  addContextMenuCommands() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof TFile)) {
          return;
        }

        menu.addItem((item) => {
          item
            .setTitle(this.commands.close_only_duplicates)
            .setIcon(this.duplicateIcon)
            .onClick(async () => {
              new Notice(this.commands.close_only_duplicates + file.path);
              this.closeOnlyDuplicates(file);
            });
        });

        menu.addItem((item) => {
          item
            .setTitle(this.commands.close_all_duplicates)
            .setIcon(this.duplicateIcon)
            .onClick(async () => {
              new Notice(this.commands.close_all_duplicates + file.path);
              this.closeAllDuplicates(file);
            });
        });
      }),
    );
  }

  addHighlightDuplicatesHandling() {
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        new Notice("layout-change");
        this.highlightDuplicates();
      }),
    );
  }

  highlightDuplicates() {
    new Notice("highlightDuplicates");
    const leaves = this.getAllOpenNotes();

    // reset to default
    for (const leaf of leaves) {
      // const tabHeader = leaf.tabHeaderEl;
      // if (tabHeader) {
      //   tabHeader.classList.forEach((cls) => {
      //     if (cls.startsWith(this.highlightCssClassNamePrefix)) {
      //       tabHeader.classList.remove(cls);
      //     }
      //   });
      // }
      const titleEl = leaf.tabHeaderInnerTitleEl;
      if (titleEl) {
        titleEl.classList.forEach((cls) => {
          if (cls.startsWith(this.highlightCssClassNamePrefix)) {
            titleEl.classList.remove(cls);
          }
        });
      }
    }

    // create groups of duplicates
    const groups = new Map<string, WorkspaceLeaf[]>();
    for (const leaf of leaves) {
      const state = leaf.getViewState();
      const file = state.state ? (state.state.file as string) : null;
      if (!file) {
        continue;
      }
      if (!groups.has(file)) {
        groups.set(file, []);
      }
      groups.get(file)?.push(leaf);
    }

    // highlight groups of duplicates
    let colorIndex = 1;
    for (const leaves of groups.values()) {
      console.log("leaves: " + leaves.length);
      if (leaves.length <= 1) {
        continue;
      }
      for (const leaf of leaves) {
        // const tabHeader = leaf.tabHeaderEl;
        // if (tabHeader) {
        //   tabHeader.classList.add(this.cssClassName);
        // }
        const titleEl = leaf.tabHeaderInnerTitleEl;
        if (titleEl) {
          titleEl.classList.add(this.highlightCssClassNamePrefix + colorIndex);
        }
      }

      colorIndex++;
    }
  }

  getAllOpenNotes(): WorkspaceLeaf[] {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    console.log("getAllOpenNotes: " + leaves.length);
    return leaves;
  }

  closeAllDuplicates(file: TFile) {
    const leaves = this.getAllOpenNotes();
    for (const leaf of leaves) {
      const state = leaf.getViewState();
      if (state.state?.file === file.path) {
        leaf.detach();
      }
    }
  }

  closeOnlyDuplicates(file: TFile) {
    const leaves = this.getAllOpenNotes();
    const active = this.app.workspace.getMostRecentLeaf();
    for (const leaf of leaves) {
      const state = leaf.getViewState();
      const isSameFile = state.state?.file === file.path;
      const isActive = leaf === active;

      if (isSameFile && !isActive) {
        leaf.detach();
      }
    }
  }
}
