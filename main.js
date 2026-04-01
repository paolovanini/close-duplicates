/*! close-duplicates v0.2.0 | (c) undefined | undefined */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => CloseDuplicatesPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  isHighlightEnabled: true,
  isHighlightBorderEnabled: true,
  isHighlightNameEnabled: true,
  maxNumberOfcolors: 10
};
var CloseDuplicatesPluginSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Highlight Duplicates").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.isHighlightEnabled).onChange(async (value) => {
        this.plugin.settings.isHighlightEnabled = value;
        await this.plugin.saveSettings();
        this.display();
        this.updateHighlight();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Highlight Border").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.isHighlightBorderEnabled).onChange(async (value) => {
        this.plugin.settings.isHighlightBorderEnabled = value;
        await this.plugin.saveSettings();
        this.display();
        this.updateHighlight();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Highlight Name").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.isHighlightNameEnabled).onChange(async (value) => {
        this.plugin.settings.isHighlightNameEnabled = value;
        await this.plugin.saveSettings();
        this.display();
        this.updateHighlight();
      })
    );
  }
  updateHighlight() {
    if (this.plugin.settings.isHighlightEnabled) {
      this.plugin.highlighter?.highlightDuplicates();
    } else {
      this.plugin.highlighter?.removeHighlightFromDuplicates();
    }
  }
};

// src/highlighter.ts
var Highlighter = class {
  constructor(app, settings) {
    this.nameHighlightCssClassPrefix = "duplicate-group-name-";
    this.borderHighlightCssClassPrefix = "duplicate-group-border-";
    this.app = app;
    this.settings = settings;
  }
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
  groupDuplicates(leaves) {
    const groups = /* @__PURE__ */ new Map();
    for (const leaf of leaves) {
      const state = leaf.getViewState();
      const file = state.state ? state.state.file : null;
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
  addHighlight(groups) {
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
              this.nameHighlightCssClassPrefix + colorIndex
            );
          }
          if (this.settings.isHighlightBorderEnabled) {
            titleEl.classList.add(
              this.borderHighlightCssClassPrefix + colorIndex
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
};

// src/main.ts
var CloseDuplicatesPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.commands = {
      close_only_duplicates: "Close only duplicates",
      close_all_duplicates: "Close all duplicates"
    };
    this.duplicateIcon = "copy-x";
  }
  /* Public Methods */
  async onload() {
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
  addContextMenuCommands() {
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof import_obsidian2.TFile)) {
          return;
        }
        menu.addItem((item) => {
          item.setTitle(this.commands.close_only_duplicates).setIcon(this.duplicateIcon).onClick(async () => {
            new import_obsidian2.Notice(this.commands.close_only_duplicates + file.path);
            this.closeOnlyDuplicates(file);
          });
        });
        menu.addItem((item) => {
          item.setTitle(this.commands.close_all_duplicates).setIcon(this.duplicateIcon).onClick(async () => {
            new import_obsidian2.Notice(this.commands.close_all_duplicates + file.path);
            this.closeAllDuplicates(file);
          });
        });
      })
    );
  }
  addHighlightDuplicatesHandling() {
    this.highlighter = new Highlighter(this.app, this.settings);
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        if (this.settings?.isHighlightEnabled && this.highlighter) {
          this.highlighter.highlightDuplicates();
        }
      })
    );
  }
  closeAllDuplicates(file) {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const state = leaf.getViewState();
      if (state.state?.file === file.path) {
        leaf.detach();
      }
    }
  }
  closeOnlyDuplicates(file) {
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
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9oaWdobGlnaHRlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBURmlsZSwgTm90aWNlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQge1xuICBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5ncyxcbiAgQ2xvc2VEdXBsaWNhdGVzUGx1Z2luU2V0dGluZ1RhYixcbiAgREVGQVVMVF9TRVRUSU5HUyxcbn0gZnJvbSBcIi4vc2V0dGluZ3MuanNcIjtcbmltcG9ydCB7IEhpZ2hsaWdodGVyIH0gZnJvbSBcIi4vaGlnaGxpZ2h0ZXIuanNcIjtcblxuLyogZXh0ZW5kZWQgV29ya3NwYWNlTGVhZiBiZWNhdXNlICd0YWJIZWFkZXJFbCcgYW5kICd0YWJIZWFkZXJJbm5lclRpdGxlRWwnIHByYWN0aWNhbGx5IGV4aXN0IGJ1dCB0aGV5IGFyZSBub3QgaW4gdHlwZSBkZWZpbml0aW9uIGZpbGUgKi9cbmRlY2xhcmUgbW9kdWxlIFwib2JzaWRpYW5cIiB7XG4gIGludGVyZmFjZSBXb3Jrc3BhY2VMZWFmIHtcbiAgICB0YWJIZWFkZXJFbDogSFRNTEVsZW1lbnQ7XG4gICAgdGFiSGVhZGVySW5uZXJUaXRsZUVsOiBIVE1MRWxlbWVudDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbG9zZUR1cGxpY2F0ZXNQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5ncyE6IENsb3NlRHVwbGljYXRlc1BsdWdpblNldHRpbmdzO1xuICBjb21tYW5kcyA9IHtcbiAgICBjbG9zZV9vbmx5X2R1cGxpY2F0ZXM6IFwiQ2xvc2Ugb25seSBkdXBsaWNhdGVzXCIsXG4gICAgY2xvc2VfYWxsX2R1cGxpY2F0ZXM6IFwiQ2xvc2UgYWxsIGR1cGxpY2F0ZXNcIixcbiAgfTtcbiAgZHVwbGljYXRlSWNvbiA9IFwiY29weS14XCI7XG4gIGhpZ2hsaWdodGVyPzogSGlnaGxpZ2h0ZXI7XG5cbiAgLyogUHVibGljIE1ldGhvZHMgKi9cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cbiAgICB0aGlzLmFkZENvbnRleHRNZW51Q29tbWFuZHMoKTtcblxuICAgIHRoaXMuYWRkSGlnaGxpZ2h0RHVwbGljYXRlc0hhbmRsaW5nKCk7XG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIC8qIFByaXZhdGUgTWV0aG9kcyAqL1xuICBwcml2YXRlIGFkZENvbnRleHRNZW51Q29tbWFuZHMoKSB7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZmlsZS1tZW51XCIsIChtZW51LCBmaWxlKSA9PiB7XG4gICAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IHtcbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAuc2V0VGl0bGUodGhpcy5jb21tYW5kcy5jbG9zZV9vbmx5X2R1cGxpY2F0ZXMpXG4gICAgICAgICAgICAuc2V0SWNvbih0aGlzLmR1cGxpY2F0ZUljb24pXG4gICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UodGhpcy5jb21tYW5kcy5jbG9zZV9vbmx5X2R1cGxpY2F0ZXMgKyBmaWxlLnBhdGgpO1xuICAgICAgICAgICAgICB0aGlzLmNsb3NlT25seUR1cGxpY2F0ZXMoZmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PiB7XG4gICAgICAgICAgaXRlbVxuICAgICAgICAgICAgLnNldFRpdGxlKHRoaXMuY29tbWFuZHMuY2xvc2VfYWxsX2R1cGxpY2F0ZXMpXG4gICAgICAgICAgICAuc2V0SWNvbih0aGlzLmR1cGxpY2F0ZUljb24pXG4gICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UodGhpcy5jb21tYW5kcy5jbG9zZV9hbGxfZHVwbGljYXRlcyArIGZpbGUucGF0aCk7XG4gICAgICAgICAgICAgIHRoaXMuY2xvc2VBbGxEdXBsaWNhdGVzKGZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkSGlnaGxpZ2h0RHVwbGljYXRlc0hhbmRsaW5nKCkge1xuICAgIHRoaXMuaGlnaGxpZ2h0ZXIgPSBuZXcgSGlnaGxpZ2h0ZXIodGhpcy5hcHAsIHRoaXMuc2V0dGluZ3MpO1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImxheW91dC1jaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncz8uaXNIaWdobGlnaHRFbmFibGVkICYmIHRoaXMuaGlnaGxpZ2h0ZXIpIHtcbiAgICAgICAgICB0aGlzLmhpZ2hsaWdodGVyLmhpZ2hsaWdodER1cGxpY2F0ZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2VBbGxEdXBsaWNhdGVzKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShcIm1hcmtkb3duXCIpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBsZWF2ZXMpIHtcbiAgICAgIGNvbnN0IHN0YXRlID0gbGVhZi5nZXRWaWV3U3RhdGUoKTtcbiAgICAgIGlmIChzdGF0ZS5zdGF0ZT8uZmlsZSA9PT0gZmlsZS5wYXRoKSB7XG4gICAgICAgIGxlYWYuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZU9ubHlEdXBsaWNhdGVzKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShcIm1hcmtkb3duXCIpO1xuICAgIGNvbnN0IGFjdGl2ZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRNb3N0UmVjZW50TGVhZigpO1xuICAgIGZvciAoY29uc3QgbGVhZiBvZiBsZWF2ZXMpIHtcbiAgICAgIGNvbnN0IHN0YXRlID0gbGVhZi5nZXRWaWV3U3RhdGUoKTtcbiAgICAgIGNvbnN0IGlzU2FtZUZpbGUgPSBzdGF0ZS5zdGF0ZT8uZmlsZSA9PT0gZmlsZS5wYXRoO1xuICAgICAgY29uc3QgaXNBY3RpdmUgPSBsZWFmID09PSBhY3RpdmU7XG5cbiAgICAgIGlmIChpc1NhbWVGaWxlICYmICFpc0FjdGl2ZSkge1xuICAgICAgICBsZWFmLmRldGFjaCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5pbXBvcnQgQ2xvc2VEdXBsaWNhdGVzUGx1Z2luIGZyb20gXCIuL21haW4uanNcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ2xvc2VEdXBsaWNhdGVzUGx1Z2luU2V0dGluZ3Mge1xyXG4gIGlzSGlnaGxpZ2h0RW5hYmxlZDogYm9vbGVhbjtcclxuICBpc0hpZ2hsaWdodEJvcmRlckVuYWJsZWQ6IGJvb2xlYW47XHJcbiAgaXNIaWdobGlnaHROYW1lRW5hYmxlZDogYm9vbGVhbjtcclxuICBtYXhOdW1iZXJPZmNvbG9yczogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUGFydGlhbDxDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5ncz4gPSB7XHJcbiAgaXNIaWdobGlnaHRFbmFibGVkOiB0cnVlLFxyXG4gIGlzSGlnaGxpZ2h0Qm9yZGVyRW5hYmxlZDogdHJ1ZSxcclxuICBpc0hpZ2hsaWdodE5hbWVFbmFibGVkOiB0cnVlLFxyXG4gIG1heE51bWJlck9mY29sb3JzOiAxMCxcclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBDbG9zZUR1cGxpY2F0ZXNQbHVnaW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENsb3NlRHVwbGljYXRlc1BsdWdpbikge1xyXG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xyXG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5KCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuXHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkhpZ2hsaWdodCBEdXBsaWNhdGVzXCIpXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5pc0hpZ2hsaWdodEVuYWJsZWQpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlzSGlnaGxpZ2h0RW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0KCk7XHJcbiAgICAgICAgICB9KSxcclxuICAgICAgKTtcclxuXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuc2V0TmFtZShcIkhpZ2hsaWdodCBCb3JkZXJcIikuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XHJcbiAgICAgIHRvZ2dsZVxyXG4gICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5pc0hpZ2hsaWdodEJvcmRlckVuYWJsZWQpXHJcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaXNIaWdobGlnaHRCb3JkZXJFbmFibGVkID0gdmFsdWU7XHJcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVIaWdobGlnaHQoKTtcclxuICAgICAgICB9KSxcclxuICAgICk7XHJcblxyXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJIaWdobGlnaHQgTmFtZVwiKS5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgdG9nZ2xlXHJcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmlzSGlnaGxpZ2h0TmFtZUVuYWJsZWQpXHJcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaXNIaWdobGlnaHROYW1lRW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgIHRoaXMudXBkYXRlSGlnaGxpZ2h0KCk7XHJcbiAgICAgICAgfSksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlSGlnaGxpZ2h0KCkge1xyXG4gICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmlzSGlnaGxpZ2h0RW5hYmxlZCkge1xyXG4gICAgICB0aGlzLnBsdWdpbi5oaWdobGlnaHRlcj8uaGlnaGxpZ2h0RHVwbGljYXRlcygpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wbHVnaW4uaGlnaGxpZ2h0ZXI/LnJlbW92ZUhpZ2hsaWdodEZyb21EdXBsaWNhdGVzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsICJpbXBvcnQgeyBBcHAsIFdvcmtzcGFjZUxlYWYgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IHsgQ2xvc2VEdXBsaWNhdGVzUGx1Z2luU2V0dGluZ3MgfSBmcm9tIFwiLi9zZXR0aW5ncy5qc1wiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhpZ2hsaWdodGVyIHtcclxuICBwcml2YXRlIGFwcDogQXBwO1xyXG4gIHByaXZhdGUgc2V0dGluZ3MhOiBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5ncztcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHNldHRpbmdzOiBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5ncykge1xyXG4gICAgdGhpcy5hcHAgPSBhcHA7XHJcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XHJcbiAgfVxyXG5cclxuICBuYW1lSGlnaGxpZ2h0Q3NzQ2xhc3NQcmVmaXggPSBcImR1cGxpY2F0ZS1ncm91cC1uYW1lLVwiO1xyXG4gIGJvcmRlckhpZ2hsaWdodENzc0NsYXNzUHJlZml4ID0gXCJkdXBsaWNhdGUtZ3JvdXAtYm9yZGVyLVwiO1xyXG5cclxuICAvKiBQdWJsaWMgTWV0aG9kcyAqL1xyXG4gIHJlbW92ZUhpZ2hsaWdodEZyb21EdXBsaWNhdGVzKCkge1xyXG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShcIm1hcmtkb3duXCIpO1xyXG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGxlYXZlcykge1xyXG4gICAgICBjb25zdCB0aXRsZUVsID0gbGVhZi50YWJIZWFkZXJJbm5lclRpdGxlRWw7XHJcbiAgICAgIGlmICh0aXRsZUVsKSB7XHJcbiAgICAgICAgdGl0bGVFbC5jbGFzc0xpc3QuZm9yRWFjaCgoY2xzKSA9PiB7XHJcbiAgICAgICAgICBpZiAoY2xzLnN0YXJ0c1dpdGgodGhpcy5ib3JkZXJIaWdobGlnaHRDc3NDbGFzc1ByZWZpeCkpIHtcclxuICAgICAgICAgICAgdGl0bGVFbC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGl0bGVFbC5jbGFzc0xpc3QuZm9yRWFjaCgoY2xzKSA9PiB7XHJcbiAgICAgICAgICBpZiAoY2xzLnN0YXJ0c1dpdGgodGhpcy5uYW1lSGlnaGxpZ2h0Q3NzQ2xhc3NQcmVmaXgpKSB7XHJcbiAgICAgICAgICAgIHRpdGxlRWwuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoaWdobGlnaHREdXBsaWNhdGVzKCkge1xyXG4gICAgdGhpcy5yZW1vdmVIaWdobGlnaHRGcm9tRHVwbGljYXRlcygpO1xyXG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShcIm1hcmtkb3duXCIpO1xyXG4gICAgY29uc3QgZ3JvdXBzID0gdGhpcy5ncm91cER1cGxpY2F0ZXMobGVhdmVzKTtcclxuICAgIHRoaXMuYWRkSGlnaGxpZ2h0KGdyb3Vwcyk7XHJcbiAgfVxyXG5cclxuICAvKiBQcml2YXRlIE1ldGhvZHMgKi9cclxuXHJcbiAgcHJpdmF0ZSBncm91cER1cGxpY2F0ZXMoXHJcbiAgICBsZWF2ZXM6IFdvcmtzcGFjZUxlYWZbXSxcclxuICApOiBNYXA8c3RyaW5nLCBXb3Jrc3BhY2VMZWFmW10+IHtcclxuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBXb3Jrc3BhY2VMZWFmW10+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgbGVhdmVzKSB7XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gbGVhZi5nZXRWaWV3U3RhdGUoKTtcclxuICAgICAgY29uc3QgZmlsZSA9IHN0YXRlLnN0YXRlID8gKHN0YXRlLnN0YXRlLmZpbGUgYXMgc3RyaW5nKSA6IG51bGw7XHJcbiAgICAgIGlmICghZmlsZSkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghZ3JvdXBzLmhhcyhmaWxlKSkge1xyXG4gICAgICAgIGdyb3Vwcy5zZXQoZmlsZSwgW10pO1xyXG4gICAgICB9XHJcbiAgICAgIGdyb3Vwcy5nZXQoZmlsZSk/LnB1c2gobGVhZik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGdyb3VwcztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSGlnaGxpZ2h0KGdyb3VwczogTWFwPHN0cmluZywgV29ya3NwYWNlTGVhZltdPikge1xyXG4gICAgbGV0IGNvbG9ySW5kZXggPSAxO1xyXG4gICAgZm9yIChjb25zdCBsZWF2ZXMgb2YgZ3JvdXBzLnZhbHVlcygpKSB7XHJcbiAgICAgIGlmIChsZWF2ZXMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChjb25zdCBsZWFmIG9mIGxlYXZlcykge1xyXG4gICAgICAgIGNvbnN0IHRpdGxlRWwgPSBsZWFmLnRhYkhlYWRlcklubmVyVGl0bGVFbDtcclxuICAgICAgICBpZiAodGl0bGVFbCkge1xyXG4gICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaXNIaWdobGlnaHROYW1lRW5hYmxlZCkge1xyXG4gICAgICAgICAgICB0aXRsZUVsLmNsYXNzTGlzdC5hZGQoXHJcbiAgICAgICAgICAgICAgdGhpcy5uYW1lSGlnaGxpZ2h0Q3NzQ2xhc3NQcmVmaXggKyBjb2xvckluZGV4LFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaXNIaWdobGlnaHRCb3JkZXJFbmFibGVkKSB7XHJcbiAgICAgICAgICAgIHRpdGxlRWwuY2xhc3NMaXN0LmFkZChcclxuICAgICAgICAgICAgICB0aGlzLmJvcmRlckhpZ2hsaWdodENzc0NsYXNzUHJlZml4ICsgY29sb3JJbmRleCxcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbG9ySW5kZXgrKztcclxuICAgICAgaWYgKGNvbG9ySW5kZXggPiB0aGlzLnNldHRpbmdzLm1heE51bWJlck9mY29sb3JzKSB7XHJcbiAgICAgICAgY29sb3JJbmRleCA9IDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUFzQzs7O0FDQXRDLHNCQUErQztBQVV4QyxJQUFNLG1CQUEyRDtBQUFBLEVBQ3RFLG9CQUFvQjtBQUFBLEVBQ3BCLDBCQUEwQjtBQUFBLEVBQzFCLHdCQUF3QjtBQUFBLEVBQ3hCLG1CQUFtQjtBQUNyQjtBQUVPLElBQU0sa0NBQU4sY0FBOEMsaUNBQWlCO0FBQUEsRUFHcEUsWUFBWSxLQUFVLFFBQStCO0FBQ25ELFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2hCO0FBQUEsRUFFQSxVQUFnQjtBQUNkLFVBQU0sRUFBRSxZQUFZLElBQUk7QUFFeEIsZ0JBQVksTUFBTTtB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QUE7QUFBQSxFQUdRLHlCQUF5QjtBQUMvQixTQUFLO0FBQUEsTUFDSCxLQUFLLElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQyxNQUFNLFNBQVM7QUFDakQsWUFBSSxFQUFFLGdCQUFnQix5QkFBUTtBQUM1QjtBQUFBLFFBQ0Y7QUFFQSxhQUFLLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGVBQ0csU0FBUyxLQUFLLFNBQVMscUJBQXFCLEVBQzVDLFFBQVEsS0FBSyxhQUFhLEVBQzFCLFFBQVEsWUFBWTtBQUNuQixnQkFBSSx3QkFBTyxLQUFLLFNBQVMsd0JBQXdCLEtBQUssSUFBSTtBQUMxRCxpQkFBSyxvQkFBb0IsSUFBSTtBQUFBLFVBQy9CLENBQUM7QUFBQSxRQUNMLENBQUM7QUFFRCxhQUFLLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGVBQ0csU0FBUyxLQUFLLFNBQVMsb0JBQW9CLEVBQzNDLFFBQVEsS0FBSyxhQUFhLEVBQzFCLFFBQVEsWUFBWTtBQUNuQixnQkFBSSx3QkFBTyxLQUFLLFNBQVMsdUJBQXVCLEtBQUssSUFBSTtBQUN6RCxpQkFBSyxtQkFBbUIsSUFBSTtBQUFBLFVBQzlCLENBQUM7QUFBQSxRQUNMLENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUNBQWlDO0FBQ3ZDLFNBQUssY0FBYyxJQUFJLFlBQVksS0FBSyxLQUFLLEtBQUssUUFBUTtBQUMxRCxTQUFLO0FBQUEsTUFDSCxLQUFLLElBQUksVUFBVSxHQUFHLGlCQUFpQixNQUFNO0FBQzNDLFlBQUksS0FBSyxVQUFVLHNCQUFzQixLQUFLLGFBQWE7QUFDekQsZUFBSyxZQUFZLG9CQUFvQjtBQUFBLFFBQ3ZDO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLG1CQUFtQixNQUFhO0FBQ3RDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0IsVUFBVTtBQUM1RCxlQUFXLFFBQVEsUUFBUTtBQUN6QixZQUFNLFFBQVEsS0FBSyxhQUFhO0FBQ2hDLFVBQUksTUFBTSxPQUFPLFNBQVMsS0FBSyxNQUFNO0FBQ25DLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRVEsb0JBQW9CLE1BQWE7QUFDdkMsVUFBTSxTQUFTLEtBQUssSUFBSSxVQUFVLGdCQUFnQixVQUFVO0FBQzVELFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxrQkFBa0I7QUFDcEQsZUFBVyxRQUFRLFFBQVE7QUFDekIsWUFBTSxRQUFRLEtBQUssYUFBYTtBQUNoQyxZQUFNLGFBQWEsTUFBTSxPQUFPLFNBQVMsS0FBSztBQUM5QyxZQUFNLFdBQVcsU0FBUztBQUUxQixVQUFJLGNBQWMsQ0FBQyxVQUFVO0FBQzNCLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
