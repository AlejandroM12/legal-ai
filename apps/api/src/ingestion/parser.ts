import { PageText } from './chunker';
import { readPageImage } from './ocr';

export async function parsePdf(buffer: Buffer): Promise<PageText[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) })
    .promise;

  const pages: PageText[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const extracted = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const text = await textOrOcr(page, extracted);
    pages.push({ page: pageNumber, text });
  }
  return pages;
}

async function textOrOcr(page: unknown, extracted: string) {
  if (extracted.length >= 40) return extracted;
  try {
    const recognized = await readPageImage(page);
    return recognized.length > extracted.length ? recognized : extracted;
  } catch {
    return extracted;
  }
}
