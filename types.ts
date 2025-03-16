// types.ts ----
// This file contains TypeScript interfaces that define our data structures

// Represents a single Datacore query linked to a Beeminder goal
export interface BeeminderQuery {
    id: string;           // Unique identifier
    name: string;         // User-friendly name
    query: string;        // Datacore query string
    beeminderGoal: string; // Beeminder goal slug
    enabled: boolean;     // Whether this query is active
    lastSyncTime: number | null; // Timestamp of last successful sync
    lastCount: number | null;    // Last count reported to Beeminder
}

// Plugin settings
export interface BeeminderSettings {
    apiKey: string;      // Beeminder API key
    queries: BeeminderQuery[]; // Array of configured queries
    autoSync: boolean;   // Whether to auto-sync
    syncIntervalMinutes: number; // How often to sync
    lastPluginRunTime: number | null; // For debugging/status
}

// Default settings when the plugin is first installed
export const DEFAULT_SETTINGS: BeeminderSettings = {
    apiKey: '',
    queries: [],
    autoSync: true,
    syncIntervalMinutes: 30,
    lastPluginRunTime: null
};