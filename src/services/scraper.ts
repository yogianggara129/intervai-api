import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeJob(url: string): Promise<string> {
  const { data } = await axios.get(url);

  const $ = cheerio.load(data);

  let text = $('body').text();

  text = text.replace(/\s+/g, ' ').trim();

  return text.slice(0, 2000);
}
