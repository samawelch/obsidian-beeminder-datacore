// view.ts ----
// This file manages the settings UI for the plugin
import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import BeeminderPlugin from './main';
import { BeeminderQuery } from './types';
import { v4 as uuidv4 } from 'uuid';

export class BeeminderSettingTab extends PluginSettingTab {
    plugin: BeeminderPlugin;

    constructor(app: App, plugin: BeeminderPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    // This is called when the settings tab is opened
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

	// In view.ts, add this after the header
	containerEl.createEl('h2', {text: 'Beeminder Sync Settings'});
	containerEl.createEl('p', {text: 'Configure your Beeminder integration below.'});

// Add a help section for queries
const helpDiv = containerEl.createDiv('query-help');
helpDiv.createEl('h4', {text: 'Datacore Query Examples:'});
const helpList = helpDiv.createEl('ul');
helpList.createEl('li', {text: '@page - All pages in the vault'});
helpList.createEl('li', {text: '@page and path = "/folder" - Pages in a specific folder'});
helpList.createEl('li', {text: '@page and #tag - Pages with a specific tag'});
helpList.createEl('li', {text: '@page and meta.status = "Complete" - Pages with specific frontmatter'});

        // API Key setting
        new Setting(containerEl)
            .setName('Beeminder API Key')
            .setDesc('Your Beeminder API token from your account settings')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    this.plugin.beeminderAPI.setApiKey(value);
                    await this.plugin.saveSettings();
                }));

        // validate API key
		new Setting(containerEl)
			  .setName('Test API Key')
			  .setDesc('Verify your Beeminder API key is valid')
			  .addButton(button => button
				.setButtonText('Test Connection')
				.onClick(async () => {
				  try {
					const isValid = await this.plugin.beeminderAPI.testApiKey();
					if (isValid) {
					  new Notice('Beeminder API key is valid!', 4000);
					} else {
					  new Notice('Invalid Beeminder API key. Please check and try again.', 4000);
					}
				  } catch (error) {
					new Notice('Error testing API key: ' + error, 4000);
				  }
				}));

        // Auto-sync toggle
        new Setting(containerEl)
            .setName('Auto Sync')
            .setDesc('Automatically sync with Beeminder at regular intervals')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoSync)
                .onChange(async (value) => {
                    this.plugin.settings.autoSync = value;
                    await this.plugin.saveSettings();
                }));

        // Sync interval setting (only shown if auto-sync is enabled)
        if (this.plugin.settings.autoSync) {
            new Setting(containerEl)
                .setName('Sync Interval (minutes)')
                .setDesc('How often to automatically sync with Beeminder')
                .addSlider(slider => slider
                    .setLimits(5, 120, 5)
                    .setValue(this.plugin.settings.syncIntervalMinutes)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.syncIntervalMinutes = value;
                        await this.plugin.saveSettings();
                    }));
        }

        // Queries section
        containerEl.createEl('h3', { text: 'Datacore Queries' });

        // Add existing queries
        this.plugin.settings.queries.forEach((query, index) => {
            this.addQuerySetting(containerEl, query, index);
        });

        // Add button for new query
        new Setting(containerEl)
            .setName('Add Query')
            .setDesc('Add a new Datacore query to sync with Beeminder')
            .addButton(button => button
                .setButtonText('Add New Query')
                .onClick(async () => {
                    const newQuery: BeeminderQuery = {
                        id: uuidv4(),
                        name: 'New Query',
                        query: 'from "/"',
                        beeminderGoal: '',
                        enabled: true,
                        lastSyncTime: null,
                        lastCount: null
                    };

                    this.plugin.settings.queries.push(newQuery);
                    await this.plugin.saveSettings();

                    // Refresh the display to show the new query
                    this.display();
                }));

        // Status section
        if (this.plugin.settings.lastPluginRunTime) {
            containerEl.createEl('h3', { text: 'Status' });

            const formattedTime = new Date(this.plugin.settings.lastPluginRunTime).toLocaleString();
            containerEl.createEl('p', {
                text: `Last plugin run: ${formattedTime}`
            });
        }
    }

    // Helper method to add a query setting group
    addQuerySetting(containerEl: HTMLElement, query: BeeminderQuery, index: number): void {
        const queryContainer = containerEl.createDiv('query-container');

        // Query header
        queryContainer.createEl('h4', { text: query.name || 'Unnamed Query' });

        // Enable/disable toggle
        new Setting(queryContainer)
            .setName('Enabled')
            .setDesc('Whether this query is active')
            .addToggle(toggle => toggle
                .setValue(query.enabled)
                .onChange(async (value) => {
                    query.enabled = value;
                    await this.plugin.saveSettings();
                }));
		// Datacore query
new Setting(queryContainer)
  .setName('Datacore Query')
  .setDesc('The Datacore query to count results from')
  .addText(text => text
    .setPlaceholder('e.g., @page or @page and #tag')
    .setValue(query.query)
    .onChange(async (value) => {
      query.query = value;
      await this.plugin.saveSettings();
    }));

        // Test query button
		new Setting(queryContainer)
		  .setName('Test Query')
		  .setDesc('Check how many results the query returns')
		  .addButton(button => button
			.setButtonText('Test')
			.onClick(async () => {
			  try {
				const count = await this.plugin.datacoreAPI.testQuery(query.query);
				// Fix the notices reference
				new Notice(`Query returned ${count} results`, 4000);
			  } catch (error) {
				// Fix the notices reference
				new Notice('Error testing query: ' + error, 4000);
			  }
			}));

        // Beeminder goal
        new Setting(queryContainer)
            .setName('Beeminder Goal')
            .setDesc('The slug of your Beeminder goal (e.g., "zettelkasten")')
            .addText(text => text
                .setPlaceholder('goal-slug')
                .setValue(query.beeminderGoal)
                .onChange(async (value) => {
                    query.beeminderGoal = value;
                    await this.plugin.saveSettings();
                }));

        // Last sync info
        if (query.lastSyncTime) {
            const formattedTime = new Date(query.lastSyncTime).toLocaleString();
            queryContainer.createEl('p', {
                text: `Last sync: ${formattedTime} (${query.lastCount} items)`
            });
        }

        // Delete button
        new Setting(queryContainer)
            .setName('Delete Query')
            .setDesc('Remove this query')
            .addButton(button => button
                .setButtonText('Delete')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings.queries.splice(index, 1);
                    await this.plugin.saveSettings();
                    this.display();
                }));

        // Add separator
        containerEl.createEl('hr');
    }
}
