// beeminder.ts ----
// Handles all interactions with the Beeminder API
export class BeeminderAPI {
    private apiKey: string;
    private baseUrl = 'https://www.beeminder.com/api/v1';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    // Set a new API key
    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
    }

    // Test the API key by fetching user info
    async testApiKey(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/users/me.json?auth_token=${this.apiKey}`);
            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error testing Beeminder API key:', error);
            return false;
        }
    }

    // Post a new datapoint to a goal
    async postDatapoint(
        goalSlug: string,
        value: number,
        comment: string = ''
    ): Promise<any> {
        const url = `${this.baseUrl}/users/me/goals/${goalSlug}/datapoints.json`;

        const formData = new FormData();
        formData.append('auth_token', this.apiKey);
        formData.append('value', value.toString());
        formData.append('comment', comment);

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Beeminder API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error posting datapoint to Beeminder:', error);
            throw error;
        }
    }

    // Fetch a user's goals
    async getGoals(): Promise<any[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/users/me/goals.json?auth_token=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching Beeminder goals:', error);
            return [];
        }
    }
}