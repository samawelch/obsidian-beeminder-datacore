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

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BeeminderPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// types.ts
var DEFAULT_SETTINGS = {
  apiKey: "",
  queries: [],
  autoSync: true,
  syncIntervalMinutes: 30,
  lastPluginRunTime: null
};

// view.ts
var import_obsidian = require("obsidian");

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

// node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// view.ts
var BeeminderSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  // This is called when the settings tab is opened
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Beeminder Sync Settings" });
    containerEl.createEl("p", { text: "Configure your Beeminder integration below." });
    const helpDiv = containerEl.createDiv("query-help");
    helpDiv.createEl("h4", { text: "Datacore Query Examples:" });
    const helpList = helpDiv.createEl("ul");
    helpList.createEl("li", { text: "@page - All pages in the vault" });
    helpList.createEl("li", { text: '@page and path = "/folder" - Pages in a specific folder' });
    helpList.createEl("li", { text: "@page and #tag - Pages with a specific tag" });
    helpList.createEl("li", { text: '@page and meta.status = "Complete" - Pages with specific frontmatter' });
    new import_obsidian.Setting(containerEl).setName("Beeminder API Key").setDesc("Your Beeminder API token from your account settings").addText((text) => text.setPlaceholder("Enter your API key").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
      this.plugin.settings.apiKey = value;
      this.plugin.beeminderAPI.setApiKey(value);
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Test API Key").setDesc("Verify your Beeminder API key is valid").addButton((button) => button.setButtonText("Test Connection").onClick(async () => {
      try {
        const isValid = await this.plugin.beeminderAPI.testApiKey();
        if (isValid) {
          new import_obsidian.Notice("Beeminder API key is valid!", 4e3);
        } else {
          new import_obsidian.Notice("Invalid Beeminder API key. Please check and try again.", 4e3);
        }
      } catch (error) {
        new import_obsidian.Notice("Error testing API key: " + error, 4e3);
      }
    }));
    new import_obsidian.Setting(containerEl).setName("Auto Sync").setDesc("Automatically sync with Beeminder at regular intervals").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoSync).onChange(async (value) => {
      this.plugin.settings.autoSync = value;
      await this.plugin.saveSettings();
    }));
    if (this.plugin.settings.autoSync) {
      new import_obsidian.Setting(containerEl).setName("Sync Interval (minutes)").setDesc("How often to automatically sync with Beeminder").addSlider((slider) => slider.setLimits(5, 120, 5).setValue(this.plugin.settings.syncIntervalMinutes).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.syncIntervalMinutes = value;
        await this.plugin.saveSettings();
      }));
    }
    containerEl.createEl("h3", { text: "Datacore Queries" });
    this.plugin.settings.queries.forEach((query, index) => {
      this.addQuerySetting(containerEl, query, index);
    });
    new import_obsidian.Setting(containerEl).setName("Add Query").setDesc("Add a new Datacore query to sync with Beeminder").addButton((button) => button.setButtonText("Add New Query").onClick(async () => {
      const newQuery = {
        id: v4_default(),
        name: "New Query",
        query: 'from "/"',
        beeminderGoal: "",
        enabled: true,
        lastSyncTime: null,
        lastCount: null
      };
      this.plugin.settings.queries.push(newQuery);
      await this.plugin.saveSettings();
      this.display();
    }));
    if (this.plugin.settings.lastPluginRunTime) {
      containerEl.createEl("h3", { text: "Status" });
      const formattedTime = new Date(this.plugin.settings.lastPluginRunTime).toLocaleString();
      containerEl.createEl("p", {
        text: `Last plugin run: ${formattedTime}`
      });
    }
  }
  // Helper method to add a query setting group
  addQuerySetting(containerEl, query, index) {
    const queryContainer = containerEl.createDiv("query-container");
    queryContainer.createEl("h4", { text: query.name || "Unnamed Query" });
    new import_obsidian.Setting(queryContainer).setName("Enabled").setDesc("Whether this query is active").addToggle((toggle) => toggle.setValue(query.enabled).onChange(async (value) => {
      query.enabled = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(queryContainer).setName("Datacore Query").setDesc("The Datacore query to count results from").addText((text) => text.setPlaceholder("e.g., @page or @page and #tag").setValue(query.query).onChange(async (value) => {
      query.query = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(queryContainer).setName("Test Query").setDesc("Check how many results the query returns").addButton((button) => button.setButtonText("Test").onClick(async () => {
      try {
        const count = await this.plugin.datacoreAPI.testQuery(query.query);
        new import_obsidian.Notice(`Query returned ${count} results`, 4e3);
      } catch (error) {
        new import_obsidian.Notice("Error testing query: " + error, 4e3);
      }
    }));
    new import_obsidian.Setting(queryContainer).setName("Beeminder Goal").setDesc('The slug of your Beeminder goal (e.g., "zettelkasten")').addText((text) => text.setPlaceholder("goal-slug").setValue(query.beeminderGoal).onChange(async (value) => {
      query.beeminderGoal = value;
      await this.plugin.saveSettings();
    }));
    if (query.lastSyncTime) {
      const formattedTime = new Date(query.lastSyncTime).toLocaleString();
      queryContainer.createEl("p", {
        text: `Last sync: ${formattedTime} (${query.lastCount} items)`
      });
    }
    new import_obsidian.Setting(queryContainer).setName("Delete Query").setDesc("Remove this query").addButton((button) => button.setButtonText("Delete").setWarning().onClick(async () => {
      this.plugin.settings.queries.splice(index, 1);
      await this.plugin.saveSettings();
      this.display();
    }));
    containerEl.createEl("hr");
  }
};

// datacore.ts
var DatacoreAPI = class {
  constructor(app) {
    this.app = app;
  }
  // Check if Datacore is available
  isDatacoreAvailable() {
    return this.app.plugins.plugins.datacore !== void 0;
  }
  // Execute a Datacore query and return results
  async executeQuery(queryString) {
    if (!this.isDatacoreAvailable()) {
      throw new Error("Datacore plugin is not enabled");
    }
    try {
      const api = this.app.plugins.plugins.datacore.api;
      return await api.query(queryString);
    } catch (error) {
      console.error("Error executing Datacore query:", error);
      throw error;
    }
  }
  // Test a query and return the count only
  async testQuery(queryString) {
    try {
      const results = await this.executeQuery(queryString);
      return Array.isArray(results) ? results.length : 0;
    } catch (error) {
      console.error("Error testing query:", error);
      throw error;
    }
  }
};

// beeminder.ts
var BeeminderAPI = class {
  constructor(apiKey) {
    this.baseUrl = "https://www.beeminder.com/api/v1";
    this.apiKey = apiKey;
  }
  // Set a new API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  // Test the API key by fetching user info
  async testApiKey() {
    try {
      const response = await fetch(`${this.baseUrl}/users/me.json?auth_token=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error("Error testing Beeminder API key:", error);
      return false;
    }
  }
  // Post a new datapoint to a goal
  async postDatapoint(goalSlug, value, comment = "") {
    const url = `${this.baseUrl}/users/me/goals/${goalSlug}/datapoints.json`;
    const formData = new FormData();
    formData.append("auth_token", this.apiKey);
    formData.append("value", value.toString());
    formData.append("comment", comment);
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Beeminder API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error posting datapoint to Beeminder:", error);
      throw error;
    }
  }
  // Fetch a user's goals
  async getGoals() {
    try {
      const response = await fetch(
        `${this.baseUrl}/users/me/goals.json?auth_token=${this.apiKey}`
      );
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching Beeminder goals:", error);
      return [];
    }
  }
};

// main.ts
var BeeminderPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.syncIntervalId = null;
  }
  // This runs when the plugin is loaded
  async onload() {
    await this.loadSettings();
    this.datacoreAPI = new DatacoreAPI(this.app);
    this.beeminderAPI = new BeeminderAPI(this.settings.apiKey);
    this.addSettingTab(new BeeminderSettingTab(this.app, this));
    this.addCommand({
      id: "sync-beeminder",
      name: "Sync now with Beeminder",
      callback: () => this.syncWithBeeminder()
    });
    this.setupSyncInterval();
    console.log("Beeminder plugin loaded");
  }
  // This runs when the plugin is disabled
  onunload() {
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
    }
    console.log("Beeminder plugin unloaded");
  }
  // Load settings from disk
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  // Save settings to disk
  async saveSettings() {
    await this.saveData(this.settings);
    this.setupSyncInterval();
  }
  // Configure the sync interval based on settings
  setupSyncInterval() {
    if (this.syncIntervalId) {
      window.clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    if (this.settings.autoSync) {
      const intervalMs = this.settings.syncIntervalMinutes * 60 * 1e3;
      this.syncIntervalId = window.setInterval(() => {
        this.syncWithBeeminder();
      }, intervalMs);
    }
  }
  // The main sync function
  async syncWithBeeminder() {
    try {
      for (const query of this.settings.queries) {
        if (!query.enabled) continue;
        const result = await this.datacoreAPI.executeQuery(query.query);
        const count = result.length;
        if (count === query.lastCount && query.lastSyncTime) continue;
        if (query.beeminderGoal) {
          await this.beeminderAPI.postDatapoint(
            query.beeminderGoal,
            count,
            `Updated from Obsidian (${(/* @__PURE__ */ new Date()).toISOString()})`
          );
          query.lastCount = count;
          query.lastSyncTime = Date.now();
        }
      }
      await this.saveSettings();
    } catch (error) {
      console.error("Error during Beeminder sync:", error);
    }
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJ0eXBlcy50cyIsICJ2aWV3LnRzIiwgIm5vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcm5nLmpzIiwgIm5vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc3RyaW5naWZ5LmpzIiwgIm5vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbmF0aXZlLmpzIiwgIm5vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCAiZGF0YWNvcmUudHMiLCAiYmVlbWluZGVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBtYWluLnRzIC0tLS1cclxuLy8gVGhpcyBpcyB0aGUgZW50cnkgcG9pbnQgZm9yIG91ciBwbHVnaW4sIHdoZXJlIE9ic2lkaWFuIHdpbGwgaW5pdGlhbGl6ZSBldmVyeXRoaW5nXHJcbmltcG9ydCB7IEFwcCwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgeyBERUZBVUxUX1NFVFRJTkdTLCBCZWVtaW5kZXJTZXR0aW5ncywgQmVlbWluZGVyUXVlcnkgfSBmcm9tICcuL3R5cGVzJztcclxuaW1wb3J0IHsgQmVlbWluZGVyU2V0dGluZ1RhYiB9IGZyb20gJy4vdmlldyc7XHJcbmltcG9ydCB7IERhdGFjb3JlQVBJIH0gZnJvbSAnLi9kYXRhY29yZSc7XHJcbmltcG9ydCB7IEJlZW1pbmRlckFQSSB9IGZyb20gJy4vYmVlbWluZGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJlZW1pbmRlclBsdWdpbiBleHRlbmRzIFBsdWdpbiB7XHJcblx0c2V0dGluZ3M6IEJlZW1pbmRlclNldHRpbmdzO1xyXG5cdGRhdGFjb3JlQVBJOiBEYXRhY29yZUFQSTtcclxuXHRiZWVtaW5kZXJBUEk6IEJlZW1pbmRlckFQSTtcclxuXHRzdGF0dXNCYXI6IEhUTUxFbGVtZW50O1xyXG5cdHN5bmNJbnRlcnZhbElkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuXHJcblx0Ly8gVGhpcyBydW5zIHdoZW4gdGhlIHBsdWdpbiBpcyBsb2FkZWRcclxuXHRhc3luYyBvbmxvYWQoKSB7XHJcblx0XHQvLyBMb2FkIHNldHRpbmdzIGZyb20gZGlza1xyXG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcclxuXHJcblx0XHQvLyBJbml0aWFsaXplIEFQSXNcclxuXHRcdHRoaXMuZGF0YWNvcmVBUEkgPSBuZXcgRGF0YWNvcmVBUEkodGhpcy5hcHApO1xyXG5cdFx0dGhpcy5iZWVtaW5kZXJBUEkgPSBuZXcgQmVlbWluZGVyQVBJKHRoaXMuc2V0dGluZ3MuYXBpS2V5KTtcclxuXHJcblx0XHQvLyBBZGQgc2V0dGluZ3MgdGFiXHJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IEJlZW1pbmRlclNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcclxuXHJcblx0XHQvLyBSZWdpc3RlciBjb21tYW5kc1xyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdzeW5jLWJlZW1pbmRlcicsXHJcblx0XHRcdG5hbWU6ICdTeW5jIG5vdyB3aXRoIEJlZW1pbmRlcicsXHJcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB0aGlzLnN5bmNXaXRoQmVlbWluZGVyKCksXHJcblx0XHR9KTtcclxuXHJcblx0XHQvLyBTdGFydCBzeW5jIGludGVydmFsIGlmIGVuYWJsZWRcclxuXHRcdHRoaXMuc2V0dXBTeW5jSW50ZXJ2YWwoKTtcclxuXHJcblx0XHRjb25zb2xlLmxvZygnQmVlbWluZGVyIHBsdWdpbiBsb2FkZWQnKTtcclxuXHR9XHJcblxyXG5cdC8vIFRoaXMgcnVucyB3aGVuIHRoZSBwbHVnaW4gaXMgZGlzYWJsZWRcclxuXHRvbnVubG9hZCgpIHtcclxuXHRcdC8vIENsZWFyIGFueSBydW5uaW5nIGludGVydmFsc1xyXG5cdFx0aWYgKHRoaXMuc3luY0ludGVydmFsSWQpIHtcclxuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5zeW5jSW50ZXJ2YWxJZCk7XHJcblx0XHR9XHJcblx0XHRjb25zb2xlLmxvZygnQmVlbWluZGVyIHBsdWdpbiB1bmxvYWRlZCcpO1xyXG5cdH1cclxuXHJcblx0Ly8gTG9hZCBzZXR0aW5ncyBmcm9tIGRpc2tcclxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcclxuXHR9XHJcblxyXG5cdC8vIFNhdmUgc2V0dGluZ3MgdG8gZGlza1xyXG5cdGFzeW5jIHNhdmVTZXR0aW5ncygpIHtcclxuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XHJcblxyXG5cdFx0Ly8gUmVzdGFydCBzeW5jIGludGVydmFsIHdpdGggcG90ZW50aWFsbHkgbmV3IHNldHRpbmdzXHJcblx0XHR0aGlzLnNldHVwU3luY0ludGVydmFsKCk7XHJcblx0fVxyXG5cclxuXHQvLyBDb25maWd1cmUgdGhlIHN5bmMgaW50ZXJ2YWwgYmFzZWQgb24gc2V0dGluZ3NcclxuXHRzZXR1cFN5bmNJbnRlcnZhbCgpIHtcclxuXHRcdC8vIENsZWFyIGFueSBleGlzdGluZyBpbnRlcnZhbFxyXG5cdFx0aWYgKHRoaXMuc3luY0ludGVydmFsSWQpIHtcclxuXHRcdFx0d2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5zeW5jSW50ZXJ2YWxJZCk7XHJcblx0XHRcdHRoaXMuc3luY0ludGVydmFsSWQgPSBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIFNldCB1cCBuZXcgaW50ZXJ2YWwgaWYgYXV0b21hdGljIHN5bmMgaXMgZW5hYmxlZFxyXG5cdFx0aWYgKHRoaXMuc2V0dGluZ3MuYXV0b1N5bmMpIHtcclxuXHRcdFx0Y29uc3QgaW50ZXJ2YWxNcyA9IHRoaXMuc2V0dGluZ3Muc3luY0ludGVydmFsTWludXRlcyAqIDYwICogMTAwMDtcclxuXHRcdFx0dGhpcy5zeW5jSW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbCgoKSA9PiB7XHJcblx0XHRcdFx0dGhpcy5zeW5jV2l0aEJlZW1pbmRlcigpO1xyXG5cdFx0XHR9LCBpbnRlcnZhbE1zKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIFRoZSBtYWluIHN5bmMgZnVuY3Rpb25cclxuXHRhc3luYyBzeW5jV2l0aEJlZW1pbmRlcigpIHtcclxuXHRcdHRyeSB7XHJcblx0XHRcdC8vIFByb2Nlc3MgZWFjaCBxdWVyeVxyXG5cdFx0XHRmb3IgKGNvbnN0IHF1ZXJ5IG9mIHRoaXMuc2V0dGluZ3MucXVlcmllcykge1xyXG5cdFx0XHRcdGlmICghcXVlcnkuZW5hYmxlZCkgY29udGludWU7XHJcblxyXG5cdFx0XHRcdC8vIEV4ZWN1dGUgRGF0YWNvcmUgcXVlcnlcclxuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmRhdGFjb3JlQVBJLmV4ZWN1dGVRdWVyeShxdWVyeS5xdWVyeSk7XHJcblx0XHRcdFx0Y29uc3QgY291bnQgPSByZXN1bHQubGVuZ3RoO1xyXG5cclxuXHRcdFx0XHQvLyBTa2lwIGlmIGNvdW50IGhhc24ndCBjaGFuZ2VkXHJcblx0XHRcdFx0aWYgKGNvdW50ID09PSBxdWVyeS5sYXN0Q291bnQgJiYgcXVlcnkubGFzdFN5bmNUaW1lKSBjb250aW51ZTtcclxuXHJcblx0XHRcdFx0Ly8gUHVzaCB0byBCZWVtaW5kZXJcclxuXHRcdFx0XHRpZiAocXVlcnkuYmVlbWluZGVyR29hbCkge1xyXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5iZWVtaW5kZXJBUEkucG9zdERhdGFwb2ludChcclxuXHRcdFx0XHRcdFx0cXVlcnkuYmVlbWluZGVyR29hbCxcclxuXHRcdFx0XHRcdFx0Y291bnQsXHJcblx0XHRcdFx0XHRcdGBVcGRhdGVkIGZyb20gT2JzaWRpYW4gKCR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfSlgXHJcblx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdC8vIFVwZGF0ZSBzeW5jIG1ldGFkYXRhXHJcblx0XHRcdFx0XHRxdWVyeS5sYXN0Q291bnQgPSBjb3VudDtcclxuXHRcdFx0XHRcdHF1ZXJ5Lmxhc3RTeW5jVGltZSA9IERhdGUubm93KCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBTYXZlIHVwZGF0ZWQgbWV0YWRhdGFcclxuXHRcdFx0YXdhaXQgdGhpcy5zYXZlU2V0dGluZ3MoKTtcclxuXHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBkdXJpbmcgQmVlbWluZGVyIHN5bmM6JywgZXJyb3IpO1xyXG5cdFx0XHQvLyBXZSBjb3VsZCBhZGQgYSBub3RpZmljYXRpb24gaGVyZVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG4iLCAiXHVGRUZGLy8gdHlwZXMudHMgLS0tLVxyXG4vLyBUaGlzIGZpbGUgY29udGFpbnMgVHlwZVNjcmlwdCBpbnRlcmZhY2VzIHRoYXQgZGVmaW5lIG91ciBkYXRhIHN0cnVjdHVyZXNcclxuXHJcbi8vIFJlcHJlc2VudHMgYSBzaW5nbGUgRGF0YWNvcmUgcXVlcnkgbGlua2VkIHRvIGEgQmVlbWluZGVyIGdvYWxcclxuZXhwb3J0IGludGVyZmFjZSBCZWVtaW5kZXJRdWVyeSB7XHJcbiAgICBpZDogc3RyaW5nOyAgICAgICAgICAgLy8gVW5pcXVlIGlkZW50aWZpZXJcclxuICAgIG5hbWU6IHN0cmluZzsgICAgICAgICAvLyBVc2VyLWZyaWVuZGx5IG5hbWVcclxuICAgIHF1ZXJ5OiBzdHJpbmc7ICAgICAgICAvLyBEYXRhY29yZSBxdWVyeSBzdHJpbmdcclxuICAgIGJlZW1pbmRlckdvYWw6IHN0cmluZzsgLy8gQmVlbWluZGVyIGdvYWwgc2x1Z1xyXG4gICAgZW5hYmxlZDogYm9vbGVhbjsgICAgIC8vIFdoZXRoZXIgdGhpcyBxdWVyeSBpcyBhY3RpdmVcclxuICAgIGxhc3RTeW5jVGltZTogbnVtYmVyIHwgbnVsbDsgLy8gVGltZXN0YW1wIG9mIGxhc3Qgc3VjY2Vzc2Z1bCBzeW5jXHJcbiAgICBsYXN0Q291bnQ6IG51bWJlciB8IG51bGw7ICAgIC8vIExhc3QgY291bnQgcmVwb3J0ZWQgdG8gQmVlbWluZGVyXHJcbn1cclxuXHJcbi8vIFBsdWdpbiBzZXR0aW5nc1xyXG5leHBvcnQgaW50ZXJmYWNlIEJlZW1pbmRlclNldHRpbmdzIHtcclxuICAgIGFwaUtleTogc3RyaW5nOyAgICAgIC8vIEJlZW1pbmRlciBBUEkga2V5XHJcbiAgICBxdWVyaWVzOiBCZWVtaW5kZXJRdWVyeVtdOyAvLyBBcnJheSBvZiBjb25maWd1cmVkIHF1ZXJpZXNcclxuICAgIGF1dG9TeW5jOiBib29sZWFuOyAgIC8vIFdoZXRoZXIgdG8gYXV0by1zeW5jXHJcbiAgICBzeW5jSW50ZXJ2YWxNaW51dGVzOiBudW1iZXI7IC8vIEhvdyBvZnRlbiB0byBzeW5jXHJcbiAgICBsYXN0UGx1Z2luUnVuVGltZTogbnVtYmVyIHwgbnVsbDsgLy8gRm9yIGRlYnVnZ2luZy9zdGF0dXNcclxufVxyXG5cclxuLy8gRGVmYXVsdCBzZXR0aW5ncyB3aGVuIHRoZSBwbHVnaW4gaXMgZmlyc3QgaW5zdGFsbGVkXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBCZWVtaW5kZXJTZXR0aW5ncyA9IHtcclxuICAgIGFwaUtleTogJycsXHJcbiAgICBxdWVyaWVzOiBbXSxcclxuICAgIGF1dG9TeW5jOiB0cnVlLFxyXG4gICAgc3luY0ludGVydmFsTWludXRlczogMzAsXHJcbiAgICBsYXN0UGx1Z2luUnVuVGltZTogbnVsbFxyXG59OyIsICIvLyB2aWV3LnRzIC0tLS1cclxuLy8gVGhpcyBmaWxlIG1hbmFnZXMgdGhlIHNldHRpbmdzIFVJIGZvciB0aGUgcGx1Z2luXHJcbmltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgTm90aWNlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IEJlZW1pbmRlclBsdWdpbiBmcm9tICcuL21haW4nO1xyXG5pbXBvcnQgeyBCZWVtaW5kZXJRdWVyeSB9IGZyb20gJy4vdHlwZXMnO1xyXG5pbXBvcnQgeyB2NCBhcyB1dWlkdjQgfSBmcm9tICd1dWlkJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCZWVtaW5kZXJTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcbiAgICBwbHVnaW46IEJlZW1pbmRlclBsdWdpbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBCZWVtaW5kZXJQbHVnaW4pIHtcclxuICAgICAgICBzdXBlcihhcHAsIHBsdWdpbik7XHJcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBpcyBjYWxsZWQgd2hlbiB0aGUgc2V0dGluZ3MgdGFiIGlzIG9wZW5lZFxyXG4gICAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xyXG4gICAgICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XHJcblxyXG5cdC8vIEluIHZpZXcudHMsIGFkZCB0aGlzIGFmdGVyIHRoZSBoZWFkZXJcclxuXHRjb250YWluZXJFbC5jcmVhdGVFbCgnaDInLCB7dGV4dDogJ0JlZW1pbmRlciBTeW5jIFNldHRpbmdzJ30pO1xyXG5cdGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge3RleHQ6ICdDb25maWd1cmUgeW91ciBCZWVtaW5kZXIgaW50ZWdyYXRpb24gYmVsb3cuJ30pO1xyXG5cclxuLy8gQWRkIGEgaGVscCBzZWN0aW9uIGZvciBxdWVyaWVzXHJcbmNvbnN0IGhlbHBEaXYgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoJ3F1ZXJ5LWhlbHAnKTtcclxuaGVscERpdi5jcmVhdGVFbCgnaDQnLCB7dGV4dDogJ0RhdGFjb3JlIFF1ZXJ5IEV4YW1wbGVzOid9KTtcclxuY29uc3QgaGVscExpc3QgPSBoZWxwRGl2LmNyZWF0ZUVsKCd1bCcpO1xyXG5oZWxwTGlzdC5jcmVhdGVFbCgnbGknLCB7dGV4dDogJ0BwYWdlIC0gQWxsIHBhZ2VzIGluIHRoZSB2YXVsdCd9KTtcclxuaGVscExpc3QuY3JlYXRlRWwoJ2xpJywge3RleHQ6ICdAcGFnZSBhbmQgcGF0aCA9IFwiL2ZvbGRlclwiIC0gUGFnZXMgaW4gYSBzcGVjaWZpYyBmb2xkZXInfSk7XHJcbmhlbHBMaXN0LmNyZWF0ZUVsKCdsaScsIHt0ZXh0OiAnQHBhZ2UgYW5kICN0YWcgLSBQYWdlcyB3aXRoIGEgc3BlY2lmaWMgdGFnJ30pO1xyXG5oZWxwTGlzdC5jcmVhdGVFbCgnbGknLCB7dGV4dDogJ0BwYWdlIGFuZCBtZXRhLnN0YXR1cyA9IFwiQ29tcGxldGVcIiAtIFBhZ2VzIHdpdGggc3BlY2lmaWMgZnJvbnRtYXR0ZXInfSk7XG5cclxuICAgICAgICAvLyBBUEkgS2V5IHNldHRpbmdcclxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0JlZW1pbmRlciBBUEkgS2V5JylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1lvdXIgQmVlbWluZGVyIEFQSSB0b2tlbiBmcm9tIHlvdXIgYWNjb3VudCBzZXR0aW5ncycpXHJcbiAgICAgICAgICAgIC5hZGRUZXh0KHRleHQgPT4gdGV4dFxyXG4gICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdFbnRlciB5b3VyIEFQSSBrZXknKVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmFwaUtleSlcclxuICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5hcGlLZXkgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5iZWVtaW5kZXJBUEkuc2V0QXBpS2V5KHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAvLyB2YWxpZGF0ZSBBUEkga2V5XG5cdFx0bmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG5cdFx0XHQgIC5zZXROYW1lKCdUZXN0IEFQSSBLZXknKVxuXHRcdFx0ICAuc2V0RGVzYygnVmVyaWZ5IHlvdXIgQmVlbWluZGVyIEFQSSBrZXkgaXMgdmFsaWQnKVxuXHRcdFx0ICAuYWRkQnV0dG9uKGJ1dHRvbiA9PiBidXR0b25cblx0XHRcdFx0LnNldEJ1dHRvblRleHQoJ1Rlc3QgQ29ubmVjdGlvbicpXG5cdFx0XHRcdC5vbkNsaWNrKGFzeW5jICgpID0+IHtcblx0XHRcdFx0ICB0cnkge1xuXHRcdFx0XHRcdGNvbnN0IGlzVmFsaWQgPSBhd2FpdCB0aGlzLnBsdWdpbi5iZWVtaW5kZXJBUEkudGVzdEFwaUtleSgpO1xuXHRcdFx0XHRcdGlmIChpc1ZhbGlkKSB7XG5cdFx0XHRcdFx0ICBuZXcgTm90aWNlKCdCZWVtaW5kZXIgQVBJIGtleSBpcyB2YWxpZCEnLCA0MDAwKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCAgbmV3IE5vdGljZSgnSW52YWxpZCBCZWVtaW5kZXIgQVBJIGtleS4gUGxlYXNlIGNoZWNrIGFuZCB0cnkgYWdhaW4uJywgNDAwMCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQgIH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0bmV3IE5vdGljZSgnRXJyb3IgdGVzdGluZyBBUEkga2V5OiAnICsgZXJyb3IsIDQwMDApO1xuXHRcdFx0XHQgIH1cblx0XHRcdFx0fSkpO1xyXG5cclxuICAgICAgICAvLyBBdXRvLXN5bmMgdG9nZ2xlXHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdBdXRvIFN5bmMnKVxyXG4gICAgICAgICAgICAuc2V0RGVzYygnQXV0b21hdGljYWxseSBzeW5jIHdpdGggQmVlbWluZGVyIGF0IHJlZ3VsYXIgaW50ZXJ2YWxzJylcclxuICAgICAgICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXHJcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1N5bmMpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1N5bmMgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgLy8gU3luYyBpbnRlcnZhbCBzZXR0aW5nIChvbmx5IHNob3duIGlmIGF1dG8tc3luYyBpcyBlbmFibGVkKVxyXG4gICAgICAgIGlmICh0aGlzLnBsdWdpbi5zZXR0aW5ncy5hdXRvU3luYykge1xyXG4gICAgICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgICAgICAgICAgIC5zZXROYW1lKCdTeW5jIEludGVydmFsIChtaW51dGVzKScpXHJcbiAgICAgICAgICAgICAgICAuc2V0RGVzYygnSG93IG9mdGVuIHRvIGF1dG9tYXRpY2FsbHkgc3luYyB3aXRoIEJlZW1pbmRlcicpXHJcbiAgICAgICAgICAgICAgICAuYWRkU2xpZGVyKHNsaWRlciA9PiBzbGlkZXJcclxuICAgICAgICAgICAgICAgICAgICAuc2V0TGltaXRzKDUsIDEyMCwgNSlcclxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY0ludGVydmFsTWludXRlcylcclxuICAgICAgICAgICAgICAgICAgICAuc2V0RHluYW1pY1Rvb2x0aXAoKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Muc3luY0ludGVydmFsTWludXRlcyA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBRdWVyaWVzIHNlY3Rpb25cclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaDMnLCB7IHRleHQ6ICdEYXRhY29yZSBRdWVyaWVzJyB9KTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGV4aXN0aW5nIHF1ZXJpZXNcclxuICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5xdWVyaWVzLmZvckVhY2goKHF1ZXJ5LCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmFkZFF1ZXJ5U2V0dGluZyhjb250YWluZXJFbCwgcXVlcnksIGluZGV4KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGJ1dHRvbiBmb3IgbmV3IHF1ZXJ5XHJcbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXHJcbiAgICAgICAgICAgIC5zZXROYW1lKCdBZGQgUXVlcnknKVxyXG4gICAgICAgICAgICAuc2V0RGVzYygnQWRkIGEgbmV3IERhdGFjb3JlIHF1ZXJ5IHRvIHN5bmMgd2l0aCBCZWVtaW5kZXInKVxyXG4gICAgICAgICAgICAuYWRkQnV0dG9uKGJ1dHRvbiA9PiBidXR0b25cclxuICAgICAgICAgICAgICAgIC5zZXRCdXR0b25UZXh0KCdBZGQgTmV3IFF1ZXJ5JylcclxuICAgICAgICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdRdWVyeTogQmVlbWluZGVyUXVlcnkgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB1dWlkdjQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ05ldyBRdWVyeScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5OiAnZnJvbSBcIi9cIicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZW1pbmRlckdvYWw6ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0U3luY1RpbWU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb3VudDogbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnF1ZXJpZXMucHVzaChuZXdRdWVyeSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlZnJlc2ggdGhlIGRpc3BsYXkgdG8gc2hvdyB0aGUgbmV3IHF1ZXJ5XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIC8vIFN0YXR1cyBzZWN0aW9uXHJcbiAgICAgICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmxhc3RQbHVnaW5SdW5UaW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMycsIHsgdGV4dDogJ1N0YXR1cycgfSk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRUaW1lID0gbmV3IERhdGUodGhpcy5wbHVnaW4uc2V0dGluZ3MubGFzdFBsdWdpblJ1blRpbWUpLnRvTG9jYWxlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogYExhc3QgcGx1Z2luIHJ1bjogJHtmb3JtYXR0ZWRUaW1lfWBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhlbHBlciBtZXRob2QgdG8gYWRkIGEgcXVlcnkgc2V0dGluZyBncm91cFxyXG4gICAgYWRkUXVlcnlTZXR0aW5nKGNvbnRhaW5lckVsOiBIVE1MRWxlbWVudCwgcXVlcnk6IEJlZW1pbmRlclF1ZXJ5LCBpbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgcXVlcnlDb250YWluZXIgPSBjb250YWluZXJFbC5jcmVhdGVEaXYoJ3F1ZXJ5LWNvbnRhaW5lcicpO1xyXG5cclxuICAgICAgICAvLyBRdWVyeSBoZWFkZXJcclxuICAgICAgICBxdWVyeUNvbnRhaW5lci5jcmVhdGVFbCgnaDQnLCB7IHRleHQ6IHF1ZXJ5Lm5hbWUgfHwgJ1VubmFtZWQgUXVlcnknIH0pO1xyXG5cclxuICAgICAgICAvLyBFbmFibGUvZGlzYWJsZSB0b2dnbGVcclxuICAgICAgICBuZXcgU2V0dGluZyhxdWVyeUNvbnRhaW5lcilcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0VuYWJsZWQnKVxyXG4gICAgICAgICAgICAuc2V0RGVzYygnV2hldGhlciB0aGlzIHF1ZXJ5IGlzIGFjdGl2ZScpXHJcbiAgICAgICAgICAgIC5hZGRUb2dnbGUodG9nZ2xlID0+IHRvZ2dsZVxyXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHF1ZXJ5LmVuYWJsZWQpXHJcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVlcnkuZW5hYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG5cdFx0Ly8gRGF0YWNvcmUgcXVlcnlcclxubmV3IFNldHRpbmcocXVlcnlDb250YWluZXIpXHJcbiAgLnNldE5hbWUoJ0RhdGFjb3JlIFF1ZXJ5JylcclxuICAuc2V0RGVzYygnVGhlIERhdGFjb3JlIHF1ZXJ5IHRvIGNvdW50IHJlc3VsdHMgZnJvbScpXHJcbiAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAuc2V0UGxhY2Vob2xkZXIoJ2UuZy4sIEBwYWdlIG9yIEBwYWdlIGFuZCAjdGFnJylcclxuICAgIC5zZXRWYWx1ZShxdWVyeS5xdWVyeSlcclxuICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgcXVlcnkucXVlcnkgPSB2YWx1ZTtcclxuICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICB9KSk7XHJcblxyXG4gICAgICAgIC8vIFRlc3QgcXVlcnkgYnV0dG9uXHJcblx0XHRuZXcgU2V0dGluZyhxdWVyeUNvbnRhaW5lcilcblx0XHQgIC5zZXROYW1lKCdUZXN0IFF1ZXJ5Jylcblx0XHQgIC5zZXREZXNjKCdDaGVjayBob3cgbWFueSByZXN1bHRzIHRoZSBxdWVyeSByZXR1cm5zJylcblx0XHQgIC5hZGRCdXR0b24oYnV0dG9uID0+IGJ1dHRvblxuXHRcdFx0LnNldEJ1dHRvblRleHQoJ1Rlc3QnKVxuXHRcdFx0Lm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0ICB0cnkge1xuXHRcdFx0XHRjb25zdCBjb3VudCA9IGF3YWl0IHRoaXMucGx1Z2luLmRhdGFjb3JlQVBJLnRlc3RRdWVyeShxdWVyeS5xdWVyeSk7XG5cdFx0XHRcdC8vIEZpeCB0aGUgbm90aWNlcyByZWZlcmVuY2Vcblx0XHRcdFx0bmV3IE5vdGljZShgUXVlcnkgcmV0dXJuZWQgJHtjb3VudH0gcmVzdWx0c2AsIDQwMDApO1xuXHRcdFx0ICB9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHQvLyBGaXggdGhlIG5vdGljZXMgcmVmZXJlbmNlXG5cdFx0XHRcdG5ldyBOb3RpY2UoJ0Vycm9yIHRlc3RpbmcgcXVlcnk6ICcgKyBlcnJvciwgNDAwMCk7XG5cdFx0XHQgIH1cblx0XHRcdH0pKTtcclxuXHJcbiAgICAgICAgLy8gQmVlbWluZGVyIGdvYWxcclxuICAgICAgICBuZXcgU2V0dGluZyhxdWVyeUNvbnRhaW5lcilcclxuICAgICAgICAgICAgLnNldE5hbWUoJ0JlZW1pbmRlciBHb2FsJylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1RoZSBzbHVnIG9mIHlvdXIgQmVlbWluZGVyIGdvYWwgKGUuZy4sIFwiemV0dGVsa2FzdGVuXCIpJylcclxuICAgICAgICAgICAgLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgICAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJ2dvYWwtc2x1ZycpXHJcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUocXVlcnkuYmVlbWluZGVyR29hbClcclxuICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBxdWVyeS5iZWVtaW5kZXJHb2FsID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIC8vIExhc3Qgc3luYyBpbmZvXHJcbiAgICAgICAgaWYgKHF1ZXJ5Lmxhc3RTeW5jVGltZSkge1xyXG4gICAgICAgICAgICBjb25zdCBmb3JtYXR0ZWRUaW1lID0gbmV3IERhdGUocXVlcnkubGFzdFN5bmNUaW1lKS50b0xvY2FsZVN0cmluZygpO1xyXG4gICAgICAgICAgICBxdWVyeUNvbnRhaW5lci5jcmVhdGVFbCgncCcsIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6IGBMYXN0IHN5bmM6ICR7Zm9ybWF0dGVkVGltZX0gKCR7cXVlcnkubGFzdENvdW50fSBpdGVtcylgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGVsZXRlIGJ1dHRvblxyXG4gICAgICAgIG5ldyBTZXR0aW5nKHF1ZXJ5Q29udGFpbmVyKVxyXG4gICAgICAgICAgICAuc2V0TmFtZSgnRGVsZXRlIFF1ZXJ5JylcclxuICAgICAgICAgICAgLnNldERlc2MoJ1JlbW92ZSB0aGlzIHF1ZXJ5JylcclxuICAgICAgICAgICAgLmFkZEJ1dHRvbihidXR0b24gPT4gYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAuc2V0QnV0dG9uVGV4dCgnRGVsZXRlJylcclxuICAgICAgICAgICAgICAgIC5zZXRXYXJuaW5nKClcclxuICAgICAgICAgICAgICAgIC5vbkNsaWNrKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5xdWVyaWVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBzZXBhcmF0b3JcclxuICAgICAgICBjb250YWluZXJFbC5jcmVhdGVFbCgnaHInKTtcclxuICAgIH1cclxufVxuIiwgIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuIEluIHRoZSBicm93c2VyIHdlIHRoZXJlZm9yZVxuLy8gcmVxdWlyZSB0aGUgY3J5cHRvIEFQSSBhbmQgZG8gbm90IHN1cHBvcnQgYnVpbHQtaW4gZmFsbGJhY2sgdG8gbG93ZXIgcXVhbGl0eSByYW5kb20gbnVtYmVyXG4vLyBnZW5lcmF0b3JzIChsaWtlIE1hdGgucmFuZG9tKCkpLlxubGV0IGdldFJhbmRvbVZhbHVlcztcbmNvbnN0IHJuZHM4ID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm5nKCkge1xuICAvLyBsYXp5IGxvYWQgc28gdGhhdCBlbnZpcm9ubWVudHMgdGhhdCBuZWVkIHRvIHBvbHlmaWxsIGhhdmUgYSBjaGFuY2UgdG8gZG8gc29cbiAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAvLyBnZXRSYW5kb21WYWx1ZXMgbmVlZHMgdG8gYmUgaW52b2tlZCBpbiBhIGNvbnRleHQgd2hlcmUgXCJ0aGlzXCIgaXMgYSBDcnlwdG8gaW1wbGVtZW50YXRpb24uXG4gICAgZ2V0UmFuZG9tVmFsdWVzID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKTtcblxuICAgIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyeXB0by5nZXRSYW5kb21WYWx1ZXMoKSBub3Qgc3VwcG9ydGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3V1aWRqcy91dWlkI2dldHJhbmRvbXZhbHVlcy1ub3Qtc3VwcG9ydGVkJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59IiwgImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xuXG5jb25zdCBieXRlVG9IZXggPSBbXTtcblxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc2xpY2UoMSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgcmV0dXJuIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgM11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDVdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA3XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDhdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxM11dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNV1dO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkoYXJyLCBvZmZzZXQgPSAwKSB7XG4gIGNvbnN0IHV1aWQgPSB1bnNhZmVTdHJpbmdpZnkoYXJyLCBvZmZzZXQpOyAvLyBDb25zaXN0ZW5jeSBjaGVjayBmb3IgdmFsaWQgVVVJRC4gIElmIHRoaXMgdGhyb3dzLCBpdCdzIGxpa2VseSBkdWUgdG8gb25lXG4gIC8vIG9mIHRoZSBmb2xsb3dpbmc6XG4gIC8vIC0gT25lIG9yIG1vcmUgaW5wdXQgYXJyYXkgdmFsdWVzIGRvbid0IG1hcCB0byBhIGhleCBvY3RldCAobGVhZGluZyB0b1xuICAvLyBcInVuZGVmaW5lZFwiIGluIHRoZSB1dWlkKVxuICAvLyAtIEludmFsaWQgaW5wdXQgdmFsdWVzIGZvciB0aGUgUkZDIGB2ZXJzaW9uYCBvciBgdmFyaWFudGAgZmllbGRzXG5cbiAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgIHRocm93IFR5cGVFcnJvcignU3RyaW5naWZpZWQgVVVJRCBpcyBpbnZhbGlkJyk7XG4gIH1cblxuICByZXR1cm4gdXVpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3RyaW5naWZ5OyIsICJjb25zdCByYW5kb21VVUlEID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLnJhbmRvbVVVSUQgJiYgY3J5cHRvLnJhbmRvbVVVSUQuYmluZChjcnlwdG8pO1xuZXhwb3J0IGRlZmF1bHQge1xuICByYW5kb21VVUlEXG59OyIsICJpbXBvcnQgbmF0aXZlIGZyb20gJy4vbmF0aXZlLmpzJztcbmltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHsgdW5zYWZlU3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICBpZiAobmF0aXZlLnJhbmRvbVVVSUQgJiYgIWJ1ZiAmJiAhb3B0aW9ucykge1xuICAgIHJldHVybiBuYXRpdmUucmFuZG9tVVVJRCgpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpOyAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG5cbiAgcm5kc1s2XSA9IHJuZHNbNl0gJiAweDBmIHwgMHg0MDtcbiAgcm5kc1s4XSA9IHJuZHNbOF0gJiAweDNmIHwgMHg4MDsgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG5cbiAgaWYgKGJ1Zikge1xuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICByZXR1cm4gdW5zYWZlU3RyaW5naWZ5KHJuZHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2NDsiLCAiLy8gZGF0YWNvcmUudHMgLS0tLVxyXG4vLyBJbnRlcmZhY2Ugd2l0aCBEYXRhY29yZSBwbHVnaW4gdG8gZXhlY3V0ZSBxdWVyaWVzXHJcbmltcG9ydCB7IEFwcCB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBjbGFzcyBEYXRhY29yZUFQSSB7XHJcbiAgcHJpdmF0ZSBhcHA6IEFwcDtcclxuXHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHApIHtcclxuICAgIHRoaXMuYXBwID0gYXBwO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hlY2sgaWYgRGF0YWNvcmUgaXMgYXZhaWxhYmxlXHJcbiAgaXNEYXRhY29yZUF2YWlsYWJsZSgpOiBib29sZWFuIHtcclxuICAgIC8vIEB0cy1pZ25vcmUgLSBEYXRhY29yZSBhZGRzIHRoaXMgdG8gdGhlIGdsb2JhbCBhcHAgb2JqZWN0XHJcbiAgICByZXR1cm4gdGhpcy5hcHAucGx1Z2lucy5wbHVnaW5zLmRhdGFjb3JlICE9PSB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICAvLyBFeGVjdXRlIGEgRGF0YWNvcmUgcXVlcnkgYW5kIHJldHVybiByZXN1bHRzXHJcbiAgYXN5bmMgZXhlY3V0ZVF1ZXJ5KHF1ZXJ5U3RyaW5nOiBzdHJpbmcpOiBQcm9taXNlPGFueVtdPiB7XHJcbiAgICBpZiAoIXRoaXMuaXNEYXRhY29yZUF2YWlsYWJsZSgpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YWNvcmUgcGx1Z2luIGlzIG5vdCBlbmFibGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gQHRzLWlnbm9yZSAtIEFjY2VzcyBEYXRhY29yZSBBUElcclxuICAgICAgY29uc3QgYXBpID0gdGhpcy5hcHAucGx1Z2lucy5wbHVnaW5zLmRhdGFjb3JlLmFwaTtcclxuICAgICAgXHJcbiAgICAgIC8vIEV4ZWN1dGUgdGhlIHF1ZXJ5IHdpdGggdGhlIHByb3BlciBzeW50YXhcclxuICAgICAgcmV0dXJuIGF3YWl0IGFwaS5xdWVyeShxdWVyeVN0cmluZyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBleGVjdXRpbmcgRGF0YWNvcmUgcXVlcnk6JywgZXJyb3IpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRlc3QgYSBxdWVyeSBhbmQgcmV0dXJuIHRoZSBjb3VudCBvbmx5XHJcbiAgYXN5bmMgdGVzdFF1ZXJ5KHF1ZXJ5U3RyaW5nOiBzdHJpbmcpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuZXhlY3V0ZVF1ZXJ5KHF1ZXJ5U3RyaW5nKTtcclxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzdWx0cykgPyByZXN1bHRzLmxlbmd0aCA6IDA7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciB0ZXN0aW5nIHF1ZXJ5OicsIGVycm9yKTtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbiAgfVxyXG59XG4iLCAiXHVGRUZGLy8gYmVlbWluZGVyLnRzIC0tLS1cclxuLy8gSGFuZGxlcyBhbGwgaW50ZXJhY3Rpb25zIHdpdGggdGhlIEJlZW1pbmRlciBBUElcclxuZXhwb3J0IGNsYXNzIEJlZW1pbmRlckFQSSB7XHJcbiAgICBwcml2YXRlIGFwaUtleTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBiYXNlVXJsID0gJ2h0dHBzOi8vd3d3LmJlZW1pbmRlci5jb20vYXBpL3YxJztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhcGlLZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuYXBpS2V5ID0gYXBpS2V5O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBhIG5ldyBBUEkga2V5XHJcbiAgICBzZXRBcGlLZXkoYXBpS2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmFwaUtleSA9IGFwaUtleTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUZXN0IHRoZSBBUEkga2V5IGJ5IGZldGNoaW5nIHVzZXIgaW5mb1xyXG4gICAgYXN5bmMgdGVzdEFwaUtleSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3RoaXMuYmFzZVVybH0vdXNlcnMvbWUuanNvbj9hdXRoX3Rva2VuPSR7dGhpcy5hcGlLZXl9YCk7XHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQVBJIHJldHVybmVkICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHRlc3RpbmcgQmVlbWluZGVyIEFQSSBrZXk6JywgZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvc3QgYSBuZXcgZGF0YXBvaW50IHRvIGEgZ29hbFxyXG4gICAgYXN5bmMgcG9zdERhdGFwb2ludChcclxuICAgICAgICBnb2FsU2x1Zzogc3RyaW5nLFxyXG4gICAgICAgIHZhbHVlOiBudW1iZXIsXHJcbiAgICAgICAgY29tbWVudDogc3RyaW5nID0gJydcclxuICAgICk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfS91c2Vycy9tZS9nb2Fscy8ke2dvYWxTbHVnfS9kYXRhcG9pbnRzLmpzb25gO1xyXG5cclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnYXV0aF90b2tlbicsIHRoaXMuYXBpS2V5KTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3ZhbHVlJywgdmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdjb21tZW50JywgY29tbWVudCk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIGJvZHk6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQmVlbWluZGVyIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgcG9zdGluZyBkYXRhcG9pbnQgdG8gQmVlbWluZGVyOicsIGVycm9yKTtcclxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEZldGNoIGEgdXNlcidzIGdvYWxzXHJcbiAgICBhc3luYyBnZXRHb2FscygpOiBQcm9taXNlPGFueVtdPiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICAgICAgICAgIGAke3RoaXMuYmFzZVVybH0vdXNlcnMvbWUvZ29hbHMuanNvbj9hdXRoX3Rva2VuPSR7dGhpcy5hcGlLZXl9YFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBUEkgcmV0dXJuZWQgJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgQmVlbWluZGVyIGdvYWxzOicsIGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRUEsSUFBQUEsbUJBQThDOzs7QUNzQnZDLElBQU0sbUJBQXNDO0FBQUEsRUFDL0MsUUFBUTtBQUFBLEVBQ1IsU0FBUyxDQUFDO0FBQUEsRUFDVixVQUFVO0FBQUEsRUFDVixxQkFBcUI7QUFBQSxFQUNyQixtQkFBbUI7QUFDdkI7OztBQzVCQSxzQkFBdUQ7OztBQ0N2RCxJQUFJO0FBQ0osSUFBTSxRQUFRLElBQUksV0FBVyxFQUFFO0FBQ2hCLFNBQVIsTUFBdUI7QUFFNUIsTUFBSSxDQUFDLGlCQUFpQjtBQUVwQixzQkFBa0IsT0FBTyxXQUFXLGVBQWUsT0FBTyxtQkFBbUIsT0FBTyxnQkFBZ0IsS0FBSyxNQUFNO0FBRS9HLFFBQUksQ0FBQyxpQkFBaUI7QUFDcEIsWUFBTSxJQUFJLE1BQU0sMEdBQTBHO0FBQUEsSUFDNUg7QUFBQSxFQUNGO0FBRUEsU0FBTyxnQkFBZ0IsS0FBSztBQUM5Qjs7O0FDWEEsSUFBTSxZQUFZLENBQUM7QUFFbkIsU0FBUyxJ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
