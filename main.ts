// main.ts ----
// This is the entry point for our plugin, where Obsidian will initialize everything
import { App, Plugin, PluginSettingTab } from 'obsidian';
import { DEFAULT_SETTINGS, BeeminderSettings, BeeminderQuery } from './types';
import { BeeminderSettingTab } from './view';
import { DatacoreAPI } from './datacore';
import { BeeminderAPI } from './beeminder';

export default class BeeminderPlugin extends Plugin {
	settings: BeeminderSettings;
	datacoreAPI: DatacoreAPI;
	beeminderAPI: BeeminderAPI;
	statusBar: HTMLElement;
	syncIntervalId: number | null = null;

	// This runs when the plugin is loaded
	async onload() {
		// Load settings from disk
		await this.loadSettings();

		// Initialize APIs
		this.datacoreAPI = new DatacoreAPI(this.app);
		this.beeminderAPI = new BeeminderAPI(this.settings.apiKey);

		// Add settings tab
		this.addSettingTab(new BeeminderSettingTab(this.app, this));

		// Register commands
		this.addCommand({
			id: 'sync-beeminder',
			name: 'Sync now with Beeminder',
			callback: () => this.syncWithBeeminder(),
		});

		// Start sync interval if enabled
		this.setupSyncInterval();

		console.log('Beeminder plugin loaded');
	}

	// This runs when the plugin is disabled
	onunload() {
		// Clear any running intervals
		if (this.syncIntervalId) {
			window.clearInterval(this.syncIntervalId);
		}
		console.log('Beeminder plugin unloaded');
	}

	// Load settings from disk
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// Save settings to disk
	async saveSettings() {
		await this.saveData(this.settings);

		// Restart sync interval with potentially new settings
		this.setupSyncInterval();
	}

	// Configure the sync interval based on settings
	setupSyncInterval() {
		// Clear any existing interval
		if (this.syncIntervalId) {
			window.clearInterval(this.syncIntervalId);
			this.syncIntervalId = null;
		}

		// Set up new interval if automatic sync is enabled
		if (this.settings.autoSync) {
			const intervalMs = this.settings.syncIntervalMinutes * 60 * 1000;
			this.syncIntervalId = window.setInterval(() => {
				this.syncWithBeeminder();
			}, intervalMs);
		}
	}

	// The main sync function
	async syncWithBeeminder() {
		try {
			// Process each query
			for (const query of this.settings.queries) {
				if (!query.enabled) continue;

				// Execute Datacore query
				const result = await this.datacoreAPI.executeQuery(query.query);
				const count = result.length;

				// Skip if count hasn't changed
				if (count === query.lastCount && query.lastSyncTime) continue;

				// Push to Beeminder
				if (query.beeminderGoal) {
					await this.beeminderAPI.postDatapoint(
						query.beeminderGoal,
						count,
						`Updated from Obsidian (${new Date().toISOString()})`
					);

					// Update sync metadata
					query.lastCount = count;
					query.lastSyncTime = Date.now();
				}
			}

			// Save updated metadata
			await this.saveSettings();

		} catch (error) {
			console.error('Error during Beeminder sync:', error);
			// We could add a notification here
		}
	}
}
