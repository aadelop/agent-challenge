import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';

const FetchStockToolResultSchema = z.object({
  price: z.number(),
  changePercent: z.number(),
  asOf: z.string(),
});

export const fetchStockTool = createTool({
  id: 'fetch-stock',
  description: 'Fetch stock quote for a given symbol using Alpha Vantage API',
  inputSchema: z.object({
    symbol: z.string().describe('Stock symbol, e.g., TSLA'),
  }),
  outputSchema: FetchStockToolResultSchema,
  execute: async ({ context }) => {
    const { symbol } = context;
    if (process.env.MOCK_MODE === 'true') {
      // Mock response for testing
      return {
        price: 150.25,
        changePercent: 2.5,
        asOf: new Date().toISOString(),
      };
    } else {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        throw new Error('ALPHA_VANTAGE_API_KEY must be set in environment variables');
      }
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        return {
          price: parseFloat(quote['05. price']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          asOf: quote['07. latest trading day'],
        };
      } else {
        throw new Error(`No data found for symbol ${symbol}`);
      }
    }
  },
});