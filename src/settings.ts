import { App, PluginSettingTab, Setting } from "obsidian";
import CloseDuplicatesPlugin from "./main.js";

export interface CloseDuplicatesPluginSettings {
  isHighlightEnabled: boolean;
  isHighlightBorderEnabled: boolean;
  isHighlightNameEnabled: boolean;
  maxNumberOfcolors: number;
}

export const DEFAULT_SETTINGS: Partial<CloseDuplicatesPluginSettings> = {
  isHighlightEnabled: true,
  isHighlightBorderEnabled: true,
  isHighlightNameEnabled: true,
  maxNumberOfcolors: 10,
};

export class CloseDuplicatesPluginSettingTab extends PluginSettingTab {
  plugin: CloseDuplicatesPlugin;

  constructor(app: App, plugin: CloseDuplicatesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Highlight Duplicates")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.isHighlightEnabled)
          .onChange(async (value) => {
            this.plugin.settings.isHighlightEnabled = value;
            await this.plugin.saveSettings();
            this.display();
            this.updateHighlight();
          }),
      );

    new Setting(containerEl).setName("Highlight Border").addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.isHighlightBorderEnabled)
        .onChange(async (value) => {
          this.plugin.settings.isHighlightBorderEnabled = value;
          await this.plugin.saveSettings();
          this.display();
          this.updateHighlight();
        }),
    );

    new Setting(containerEl).setName("Highlight Name").addToggle((toggle) =>
      toggle
        .setValue(this.plugin.settings.isHighlightNameEnabled)
        .onChange(async (value) => {
          this.plugin.settings.isHighlightNameEnabled = value;
          await this.plugin.saveSettings();
          this.display();
          this.updateHighlight();
        }),
    );
  }

  updateHighlight() {
    if (this.plugin.settings.isHighlightEnabled) {
      this.plugin.highlighter?.highlightDuplicates();
    } else {
      this.plugin.highlighter?.removeHighlightFromDuplicates();
    }
  }
}
