import { App, WorkspaceLeaf } from "obsidian";

export class Highlighter {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  highlightCssClassNamePrefix = "duplicate-group-";

  /* Public Methods */
  removeHighlightToDuplicates() {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
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
  }

  highlightDuplicates() {
    this.removeHighlightToDuplicates();
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    const groups = this.groupDuplicates(leaves);
    this.addHighlight(groups);
  }

  /* Private Methods */

  private groupDuplicates(
    leaves: WorkspaceLeaf[],
  ): Map<string, WorkspaceLeaf[]> {
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

    return groups;
  }

  private addHighlight(groups: Map<string, WorkspaceLeaf[]>) {
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
}
