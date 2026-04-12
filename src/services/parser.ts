import pdfParse from 'pdf-parse';

export async function parseCV(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);

    let text = data.text;

    text = text.replace(/\s+/g, ' ').trim();

    return text.slice(0, 2000); // limit token
  } catch {
    throw new Error('Failed to parse PDF');
  }
}
