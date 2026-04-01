import { Plugin, TFile, Notice } from "obsidian";
import {
  CloseDuplicatesPluginSettings,
  CloseDuplicatesPluginSettingTab,
  DEFAULT_SETTINGS,
} from "./settings.js";
import { Highlighter } from "./highlighter.js";

/* extended WorkspaceLeaf because 'tabHeaderEl' and 'tabHeaderInnerTitleEl' practically exist but they are not in type definition file */
declare module "obsidian" {
  interface WorkspaceLeaf {
    tabHeaderEl: HTMLElement;
    tabHeaderInnerTitleEl: HTMLElement;
  }
}

export default class CloseDuplicatesPlugin extends Plugin {
  settings!: CloseDuplicatesPluginSettings;
  commands = {
    close_only_duplicates: "Close only duplicates",
    close_all_duplicates: "Close all duplicates",
  };
  duplicateIcon = "copy-x";
  highlighter?: Highlighter;

  /* Public Methods */
  async onload() {
    this.highlighter = new Highlighter(this.app);

    await this.loadSettings();
    this.addSettingTab(new CloseDuplicatesPluginSettingTab(this.app, this));

    this.addContextMenuCommands();
    this.addHighlightDuplicatesHandling();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /* Private Methods */
  private addContextMenuCommands() {
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

  private addHighlightDuplicatesHandling() {
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        new Notice("layout-change"); // TODO: remove
        if (this.settings?.isHighlightEnabled && this.highlighter) {
          this.highlighter.highlightDuplicates();
        }
      }),
    );
  }

  private closeAllDuplicates(file: TFile) {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const state = leaf.getViewState();
      if (state.state?.file === file.path) {
        leaf.detach();
      }
    }
  }

  private closeOnlyDuplicates(file: TFile) {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
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
