import { App, PluginSettingTab, Setting } from "obsidian";
import CloseDuplicatesPlugin from "./main.js";

export interface CloseDuplicatesPluginSettings {
  //sampleValue: string;
  isHighlightEnabled: boolean;
}

export const DEFAULT_SETTINGS: Partial<CloseDuplicatesPluginSettings> = {
  //   sampleValue: "default",
  isHighlightEnabled: true,
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
            if (this.plugin.settings.isHighlightEnabled) {
              this.plugin.highlighter?.highlightDuplicates();
            } else {
              this.plugin.highlighter?.removeHighlightToDuplicates();
            }

            this.display();
          }),
      );

    // new Setting(containerEl).setName("Default value").addText((text) =>
    //   text
    //     .setPlaceholder("Lorem ipsum")
    //     .setValue(this.plugin.settings.sampleValue)
    //     .onChange(async (value) => {
    //       this.plugin.settings.sampleValue = value;
    //       await this.plugin.saveSettings();
    //     }),
    // );
  }
}
