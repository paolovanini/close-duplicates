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
  //   sampleValue: "default",
  isHighlightEnabled: true
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
        if (this.plugin.settings.isHighlightEnabled) {
          this.plugin.highlighter?.highlightDuplicates();
        } else {
          this.plugin.highlighter?.removeHighlightToDuplicates();
        }
        this.display();
      })
    );
  }
};

// src/highlighter.ts
var Highlighter = class {
  constructor(app) {
    this.highlightCssClassNamePrefix = "duplicate-group-";
    this.app = app;
  }
  /* Public Methods */
  removeHighlightToDuplicates() {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
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
      console.log("leaves: " + leaves.length);
      if (leaves.length <= 1) {
        continue;
      }
      for (const leaf of leaves) {
        const titleEl = leaf.tabHeaderInnerTitleEl;
        if (titleEl) {
          titleEl.classList.add(this.highlightCssClassNamePrefix + colorIndex);
        }
      }
      colorIndex++;
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
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        new import_obsidian2.Notice("layout-change");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3NldHRpbmdzLnRzIiwgInNyYy9oaWdobGlnaHRlci50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgUGx1Z2luLCBURmlsZSwgTm90aWNlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQge1xuICBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5ncyxcbiAgQ2xvc2VEdXBsaWNhdGVzUGx1Z2luU2V0dGluZ1RhYixcbiAgREVGQVVMVF9TRVRUSU5HUyxcbn0gZnJvbSBcIi4vc2V0dGluZ3MuanNcIjtcbmltcG9ydCB7IEhpZ2hsaWdodGVyIH0gZnJvbSBcIi4vaGlnaGxpZ2h0ZXIuanNcIjtcblxuLyogZXh0ZW5kZWQgV29ya3NwYWNlTGVhZiBiZWNhdXNlICd0YWJIZWFkZXJFbCcgYW5kICd0YWJIZWFkZXJJbm5lclRpdGxlRWwnIHByYWN0aWNhbGx5IGV4aXN0IGJ1dCB0aGV5IGFyZSBub3QgaW4gdHlwZSBkZWZpbml0aW9uIGZpbGUgKi9cbmRlY2xhcmUgbW9kdWxlIFwib2JzaWRpYW5cIiB7XG4gIGludGVyZmFjZSBXb3Jrc3BhY2VMZWFmIHtcbiAgICB0YWJIZWFkZXJFbDogSFRNTEVsZW1lbnQ7XG4gICAgdGFiSGVhZGVySW5uZXJUaXRsZUVsOiBIVE1MRWxlbWVudDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbG9zZUR1cGxpY2F0ZXNQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5ncyE6IENsb3NlRHVwbGljYXRlc1BsdWdpblNldHRpbmdzO1xuICBjb21tYW5kcyA9IHtcbiAgICBjbG9zZV9vbmx5X2R1cGxpY2F0ZXM6IFwiQ2xvc2Ugb25seSBkdXBsaWNhdGVzXCIsXG4gICAgY2xvc2VfYWxsX2R1cGxpY2F0ZXM6IFwiQ2xvc2UgYWxsIGR1cGxpY2F0ZXNcIixcbiAgfTtcbiAgZHVwbGljYXRlSWNvbiA9IFwiY29weS14XCI7XG4gIGhpZ2hsaWdodGVyPzogSGlnaGxpZ2h0ZXI7XG5cbiAgLyogUHVibGljIE1ldGhvZHMgKi9cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIHRoaXMuaGlnaGxpZ2h0ZXIgPSBuZXcgSGlnaGxpZ2h0ZXIodGhpcy5hcHApO1xuXG4gICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IENsb3NlRHVwbGljYXRlc1BsdWdpblNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIHRoaXMuYWRkQ29udGV4dE1lbnVDb21tYW5kcygpO1xuICAgIHRoaXMuYWRkSGlnaGxpZ2h0RHVwbGljYXRlc0hhbmRsaW5nKCk7XG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIC8qIFByaXZhdGUgTWV0aG9kcyAqL1xuICBwcml2YXRlIGFkZENvbnRleHRNZW51Q29tbWFuZHMoKSB7XG4gICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZmlsZS1tZW51XCIsIChtZW51LCBmaWxlKSA9PiB7XG4gICAgICAgIGlmICghKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IHtcbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAuc2V0VGl0bGUodGhpcy5jb21tYW5kcy5jbG9zZV9vbmx5X2R1cGxpY2F0ZXMpXG4gICAgICAgICAgICAuc2V0SWNvbih0aGlzLmR1cGxpY2F0ZUljb24pXG4gICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UodGhpcy5jb21tYW5kcy5jbG9zZV9vbmx5X2R1cGxpY2F0ZXMgKyBmaWxlLnBhdGgpO1xuICAgICAgICAgICAgICB0aGlzLmNsb3NlT25seUR1cGxpY2F0ZXMoZmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbWVudS5hZGRJdGVtKChpdGVtKSA9PiB7XG4gICAgICAgICAgaXRlbVxuICAgICAgICAgICAgLnNldFRpdGxlKHRoaXMuY29tbWFuZHMuY2xvc2VfYWxsX2R1cGxpY2F0ZXMpXG4gICAgICAgICAgICAuc2V0SWNvbih0aGlzLmR1cGxpY2F0ZUljb24pXG4gICAgICAgICAgICAub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIG5ldyBOb3RpY2UodGhpcy5jb21tYW5kcy5jbG9zZV9hbGxfZHVwbGljYXRlcyArIGZpbGUucGF0aCk7XG4gICAgICAgICAgICAgIHRoaXMuY2xvc2VBbGxEdXBsaWNhdGVzKGZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkSGlnaGxpZ2h0RHVwbGljYXRlc0hhbmRsaW5nKCkge1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbihcImxheW91dC1jaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBuZXcgTm90aWNlKFwibGF5b3V0LWNoYW5nZVwiKTsgLy8gVE9ETzogcmVtb3ZlXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzPy5pc0hpZ2hsaWdodEVuYWJsZWQgJiYgdGhpcy5oaWdobGlnaHRlcikge1xuICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0ZXIuaGlnaGxpZ2h0RHVwbGljYXRlcygpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZUFsbER1cGxpY2F0ZXMoZmlsZTogVEZpbGUpIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFwibWFya2Rvd25cIik7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGxlYXZlcykge1xuICAgICAgY29uc3Qgc3RhdGUgPSBsZWFmLmdldFZpZXdTdGF0ZSgpO1xuICAgICAgaWYgKHN0YXRlLnN0YXRlPy5maWxlID09PSBmaWxlLnBhdGgpIHtcbiAgICAgICAgbGVhZi5kZXRhY2goKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNsb3NlT25seUR1cGxpY2F0ZXMoZmlsZTogVEZpbGUpIHtcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFwibWFya2Rvd25cIik7XG4gICAgY29uc3QgYWN0aXZlID0gdGhpcy5hcHAud29ya3NwYWNlLmdldE1vc3RSZWNlbnRMZWFmKCk7XG4gICAgZm9yIChjb25zdCBsZWFmIG9mIGxlYXZlcykge1xuICAgICAgY29uc3Qgc3RhdGUgPSBsZWFmLmdldFZpZXdTdGF0ZSgpO1xuICAgICAgY29uc3QgaXNTYW1lRmlsZSA9IHN0YXRlLnN0YXRlPy5maWxlID09PSBmaWxlLnBhdGg7XG4gICAgICBjb25zdCBpc0FjdGl2ZSA9IGxlYWYgPT09IGFjdGl2ZTtcblxuICAgICAgaWYgKGlzU2FtZUZpbGUgJiYgIWlzQWN0aXZlKSB7XG4gICAgICAgIGxlYWYuZGV0YWNoKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nIH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCBDbG9zZUR1cGxpY2F0ZXNQbHVnaW4gZnJvbSBcIi4vbWFpbi5qc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5ncyB7XHJcbiAgLy9zYW1wbGVWYWx1ZTogc3RyaW5nO1xyXG4gIGlzSGlnaGxpZ2h0RW5hYmxlZDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0VUVElOR1M6IFBhcnRpYWw8Q2xvc2VEdXBsaWNhdGVzUGx1Z2luU2V0dGluZ3M+ID0ge1xyXG4gIC8vICAgc2FtcGxlVmFsdWU6IFwiZGVmYXVsdFwiLFxyXG4gIGlzSGlnaGxpZ2h0RW5hYmxlZDogdHJ1ZSxcclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBDbG9zZUR1cGxpY2F0ZXNQbHVnaW5TZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgcGx1Z2luOiBDbG9zZUR1cGxpY2F0ZXNQbHVnaW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENsb3NlRHVwbGljYXRlc1BsdWdpbikge1xyXG4gICAgc3VwZXIoYXBwLCBwbHVnaW4pO1xyXG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5KCk6IHZvaWQge1xyXG4gICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcclxuXHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkhpZ2hsaWdodCBEdXBsaWNhdGVzXCIpXHJcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cclxuICAgICAgICB0b2dnbGVcclxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5pc0hpZ2hsaWdodEVuYWJsZWQpXHJcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlzSGlnaGxpZ2h0RW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmlzSGlnaGxpZ2h0RW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLmhpZ2hsaWdodGVyPy5oaWdobGlnaHREdXBsaWNhdGVzKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uaGlnaGxpZ2h0ZXI/LnJlbW92ZUhpZ2hsaWdodFRvRHVwbGljYXRlcygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICApO1xyXG5cclxuICAgIC8vIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiRGVmYXVsdCB2YWx1ZVwiKS5hZGRUZXh0KCh0ZXh0KSA9PlxyXG4gICAgLy8gICB0ZXh0XHJcbiAgICAvLyAgICAgLnNldFBsYWNlaG9sZGVyKFwiTG9yZW0gaXBzdW1cIilcclxuICAgIC8vICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2FtcGxlVmFsdWUpXHJcbiAgICAvLyAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgLy8gICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc2FtcGxlVmFsdWUgPSB2YWx1ZTtcclxuICAgIC8vICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgLy8gICAgIH0pLFxyXG4gICAgLy8gKTtcclxuICB9XHJcbn1cclxuIiwgImltcG9ydCB7IEFwcCwgV29ya3NwYWNlTGVhZiB9IGZyb20gXCJvYnNpZGlhblwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEhpZ2hsaWdodGVyIHtcclxuICBwcml2YXRlIGFwcDogQXBwO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCkge1xyXG4gICAgdGhpcy5hcHAgPSBhcHA7XHJcbiAgfVxyXG5cclxuICBoaWdobGlnaHRDc3NDbGFzc05hbWVQcmVmaXggPSBcImR1cGxpY2F0ZS1ncm91cC1cIjtcclxuXHJcbiAgLyogUHVibGljIE1ldGhvZHMgKi9cclxuICByZW1vdmVIaWdobGlnaHRUb0R1cGxpY2F0ZXMoKSB7XHJcbiAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFwibWFya2Rvd25cIik7XHJcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgbGVhdmVzKSB7XHJcbiAgICAgIC8vIGNvbnN0IHRhYkhlYWRlciA9IGxlYWYudGFiSGVhZGVyRWw7XHJcbiAgICAgIC8vIGlmICh0YWJIZWFkZXIpIHtcclxuICAgICAgLy8gICB0YWJIZWFkZXIuY2xhc3NMaXN0LmZvckVhY2goKGNscykgPT4ge1xyXG4gICAgICAvLyAgICAgaWYgKGNscy5zdGFydHNXaXRoKHRoaXMuaGlnaGxpZ2h0Q3NzQ2xhc3NOYW1lUHJlZml4KSkge1xyXG4gICAgICAvLyAgICAgICB0YWJIZWFkZXIuY2xhc3NMaXN0LnJlbW92ZShjbHMpO1xyXG4gICAgICAvLyAgICAgfVxyXG4gICAgICAvLyAgIH0pO1xyXG4gICAgICAvLyB9XHJcbiAgICAgIGNvbnN0IHRpdGxlRWwgPSBsZWFmLnRhYkhlYWRlcklubmVyVGl0bGVFbDtcclxuICAgICAgaWYgKHRpdGxlRWwpIHtcclxuICAgICAgICB0aXRsZUVsLmNsYXNzTGlzdC5mb3JFYWNoKChjbHMpID0+IHtcclxuICAgICAgICAgIGlmIChjbHMuc3RhcnRzV2l0aCh0aGlzLmhpZ2hsaWdodENzc0NsYXNzTmFtZVByZWZpeCkpIHtcclxuICAgICAgICAgICAgdGl0bGVFbC5jbGFzc0xpc3QucmVtb3ZlKGNscyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhpZ2hsaWdodER1cGxpY2F0ZXMoKSB7XHJcbiAgICB0aGlzLnJlbW92ZUhpZ2hsaWdodFRvRHVwbGljYXRlcygpO1xyXG4gICAgY29uc3QgbGVhdmVzID0gdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShcIm1hcmtkb3duXCIpO1xyXG4gICAgY29uc3QgZ3JvdXBzID0gdGhpcy5ncm91cER1cGxpY2F0ZXMobGVhdmVzKTtcclxuICAgIHRoaXMuYWRkSGlnaGxpZ2h0KGdyb3Vwcyk7XHJcbiAgfVxyXG5cclxuICAvKiBQcml2YXRlIE1ldGhvZHMgKi9cclxuXHJcbiAgcHJpdmF0ZSBncm91cER1cGxpY2F0ZXMoXHJcbiAgICBsZWF2ZXM6IFdvcmtzcGFjZUxlYWZbXSxcclxuICApOiBNYXA8c3RyaW5nLCBXb3Jrc3BhY2VMZWFmW10+IHtcclxuICAgIGNvbnN0IGdyb3VwcyA9IG5ldyBNYXA8c3RyaW5nLCBXb3Jrc3BhY2VMZWFmW10+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgbGVhdmVzKSB7XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gbGVhZi5nZXRWaWV3U3RhdGUoKTtcclxuICAgICAgY29uc3QgZmlsZSA9IHN0YXRlLnN0YXRlID8gKHN0YXRlLnN0YXRlLmZpbGUgYXMgc3RyaW5nKSA6IG51bGw7XHJcbiAgICAgIGlmICghZmlsZSkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghZ3JvdXBzLmhhcyhmaWxlKSkge1xyXG4gICAgICAgIGdyb3Vwcy5zZXQoZmlsZSwgW10pO1xyXG4gICAgICB9XHJcbiAgICAgIGdyb3Vwcy5nZXQoZmlsZSk/LnB1c2gobGVhZik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGdyb3VwcztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYWRkSGlnaGxpZ2h0KGdyb3VwczogTWFwPHN0cmluZywgV29ya3NwYWNlTGVhZltdPikge1xyXG4gICAgbGV0IGNvbG9ySW5kZXggPSAxO1xyXG4gICAgZm9yIChjb25zdCBsZWF2ZXMgb2YgZ3JvdXBzLnZhbHVlcygpKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwibGVhdmVzOiBcIiArIGxlYXZlcy5sZW5ndGgpO1xyXG4gICAgICBpZiAobGVhdmVzLmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChjb25zdCBsZWFmIG9mIGxlYXZlcykge1xyXG4gICAgICAgIC8vIGNvbnN0IHRhYkhlYWRlciA9IGxlYWYudGFiSGVhZGVyRWw7XHJcbiAgICAgICAgLy8gaWYgKHRhYkhlYWRlcikge1xyXG4gICAgICAgIC8vICAgdGFiSGVhZGVyLmNsYXNzTGlzdC5hZGQodGhpcy5jc3NDbGFzc05hbWUpO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICBjb25zdCB0aXRsZUVsID0gbGVhZi50YWJIZWFkZXJJbm5lclRpdGxlRWw7XHJcbiAgICAgICAgaWYgKHRpdGxlRWwpIHtcclxuICAgICAgICAgIHRpdGxlRWwuY2xhc3NMaXN0LmFkZCh0aGlzLmhpZ2hsaWdodENzc0NsYXNzTmFtZVByZWZpeCArIGNvbG9ySW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29sb3JJbmRleCsrO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQUEsbUJBQXNDOzs7QUNBdEMsc0JBQStDO0FBUXhDLElBQU0sbUJBQTJEO0FBQUE7QUFBQSxFQUV0RSxvQkFBb0I7QUFDdEI7QUFFTyxJQUFNLGtDQUFOLGNBQThDLGlDQUFpQjtBQUFBLEVBR3BFLFlBQVksS0FBVSxRQUErQjtBQUNuRCxVQUFNLEtBQUssTUFBTTtBQUNqQixTQUFLLFNBQVM7QUFBQSxFQUNoQjtBQUFBLEVBRUEsVUFBZ0I7QUFDZCxVQUFNLEVBQUUsWUFBWSxJQUFJO0FBRXhCLGdCQUFZLE1BQU07QUFFbEIsUUFBSSx3QkFBUSxXQUFXLEVBQ3BCLFFBQVEsc0JBQXNCLEVBQzlCO0FBQUEsTUFBVSxDQUFDLFdBQ1YsT0FDRyxTQUFTLEtBQUssT0FBTyxTQUFTLGtC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QUssUUFBUTtBQUFBLEVBQ25DO0FBQUE7QUFBQSxFQUdRLHlCQUF5QjtBQUMvQixTQUFLO0FBQUEsTUFDSCxLQUFLLElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQyxNQUFNLFNBQVM7QUFDakQsWUFBSSxFQUFFLGdCQUFnQix5QkFBUTtBQUM1QjtBQUFBLFFBQ0Y7QUFFQSxhQUFLLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGVBQ0csU0FBUyxLQUFLLFNBQVMscUJBQXFCLEVBQzVDLFFBQVEsS0FBSyxhQUFhLEVBQzFCLFFBQVEsWUFBWTtBQUNuQixnQkFBSSx3QkFBTyxLQUFLLFNBQVMsd0JBQXdCLEtBQUssSUFBSTtBQUMxRCxpQkFBSyxvQkFBb0IsSUFBSTtBQUFBLFVBQy9CLENBQUM7QUFBQSxRQUNMLENBQUM7QUFFRCxhQUFLLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGVBQ0csU0FBUyxLQUFLLFNBQVMsb0JBQW9CLEVBQzNDLFFBQVEsS0FBSyxhQUFhLEVBQzFCLFFBQVEsWUFBWTtBQUNuQixnQkFBSSx3QkFBTyxLQUFLLFNBQVMsdUJBQXVCLEtBQUssSUFBSTtBQUN6RCxpQkFBSyxtQkFBbUIsSUFBSTtBQUFBLFVBQzlCLENBQUM7QUFBQSxRQUNMLENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUFBLEVBRVEsaUNBQWlDO0FBQ3ZDLFNBQUs7QUFBQSxNQUNILEtBQUssSUFBSSxVQUFVLEdBQUcsaUJBQWlCLE1BQU07QUFDM0MsWUFBSSx3QkFBTyxlQUFlO0FBQzFCLFlBQUksS0FBSyxVQUFVLHNCQUFzQixLQUFLLGFBQWE7QUFDekQsZUFBSyxZQUFZLG9CQUFvQjtBQUFBLFFBQ3ZDO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFBQSxFQUVRLG1CQUFtQixNQUFhO0FBQ3RDLFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxnQkFBZ0IsVUFBVTtBQUM1RCxlQUFXLFFBQVEsUUFBUTtBQUN6QixZQUFNLFFBQVEsS0FBSyxhQUFhO0FBQ2hDLFVBQUksTUFBTSxPQUFPLFNBQVMsS0FBSyxNQUFNO0FBQ25DLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBRVEsb0JBQW9CLE1BQWE7QUFDdkMsVUFBTSxTQUFTLEtBQUssSUFBSSxVQUFVLGdCQUFnQixVQUFVO0FBQzVELFVBQU0sU0FBUyxLQUFLLElBQUksVUFBVSxrQkFBa0I7QUFDcEQsZUFBVyxRQUFRLFFBQVE7QUFDekIsWUFBTSxRQUFRLEtBQUssYUFBYTtBQUNoQyxZQUFNLGFBQWEsTUFBTSxPQUFPLFNBQVMsS0FBSztBQUM5QyxZQUFNLFdBQVcsU0FBUztBQUUxQixVQUFJLGNBQWMsQ0FBQyxVQUFVO0FBQzNCLGFBQUssT0FBTztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
