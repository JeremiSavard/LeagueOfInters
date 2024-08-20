import dotenv from 'dotenv';
import axios from 'axios';
import pLimit from 'p-limit';

dotenv.config();

//const { createClient } = require('@supabase/supabase-js');

// Create a limit function to control the rate of requests
const limit = pLimit(5); // Set the limit to 20 requests per second

// Replace with your own Supabase URL and Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
//const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Riot Games API endpoints
const CHALLENGER_API_URL = 'https://na1.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5';
const SUMMONER_API_URL = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/';

// Get the API key from environment variables
const API_KEY = process.env.RIOT_API_KEY_DEV; // Ensure you have RIOT_API_KEY in your .env file

// Function to introduce a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch data from the Challenger API and extract summoner IDs
async function fetchSummonerIds() {
    try {
        const response = await axios.get(CHALLENGER_API_URL, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        });

        const data = response.data;
        const summonerIds = data.entries.map(entry => entry.summonerId);
        console.log('Summoner IDs:', summonerIds);

        // Fetch PUUIDs for each summoner ID with rate limiting
        await fetchPuuids(summonerIds);

    } catch (error) {
        console.error('Error fetching summoner IDs:', error.message);
    }
}

// Function to fetch PUUIDs for each summoner ID with a delay
async function fetchPuuids(summonerIds) {
    try {
        for (const summonerId of summonerIds) {
            await fetchPuuid(summonerId);
            await sleep(2000); // Wait for 2 seconds before the next request
        }
    } catch (error) {
        console.error('Error fetching PUUIDs:', error.message);
    }
}

// Function to fetch PUUID for a single summoner ID
async function fetchPuuid(summonerId) {
    try {
        const response = await axios.get(`${SUMMONER_API_URL}${summonerId}`, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        });
        const puuid = response.data.puuid;
        console.log(`Summoner ID: ${summonerId}, PUUID: ${puuid}`);
        return { summonerId, puuid };
    } catch (error) {
        console.error(`Error fetching PUUID for summoner ID ${summonerId}:`, error.message);
        return { summonerId, puuid: null };
    }
}

// Execute the function to start the process
fetchSummonerIds();
