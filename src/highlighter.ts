import { App, WorkspaceLeaf } from "obsidian";
import { CloseDuplicatesPluginSettings } from "./settings.js";

export class Highlighter {
  private app: App;
  private settings!: CloseDuplicatesPluginSettings;

  constructor(app: App, settings: CloseDuplicatesPluginSettings) {
    this.app = app;
    this.settings = settings;
  }

  nameHighlightCssClassPrefix = "duplicate-group-name-";
  borderHighlightCssClassPrefix = "duplicate-group-border-";

  /* Public Methods */
  removeHighlightFromDuplicates() {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const titleEl = leaf.tabHeaderInnerTitleEl;
      if (titleEl) {
        titleEl.classList.forEach((cls) => {
          if (cls.startsWith(this.borderHighlightCssClassPrefix)) {
            titleEl.classList.remove(cls);
          }
        });
        titleEl.classList.forEach((cls) => {
          if (cls.startsWith(this.nameHighlightCssClassPrefix)) {
            titleEl.classList.remove(cls);
          }
        });
      }
    }
  }

  highlightDuplicates() {
    this.removeHighlightFromDuplicates();
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
      if (leaves.length <= 1) {
        continue;
      }

      for (const leaf of leaves) {
        const titleEl = leaf.tabHeaderInnerTitleEl;
        if (titleEl) {
          if (this.settings.isHighlightNameEnabled) {
            titleEl.classList.add(
              this.nameHighlightCssClassPrefix + colorIndex,
            );
          }
          if (this.settings.isHighlightBorderEnabled) {
            titleEl.classList.add(
              this.borderHighlightCssClassPrefix + colorIndex,
            );
          }
        }
      }

      colorIndex++;
      if (colorIndex > this.settings.maxNumberOfcolors) {
        colorIndex = 1;
      }
    }
  }
}
