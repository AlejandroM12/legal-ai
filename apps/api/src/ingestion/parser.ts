import { PageText } from './chunker';

export async function parsePdf(buffer: Buffer): Promise<PageText[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const document = await pdfjs.getDocument({ data: new Uint8Array(buffer) })
    .promise;

  const pages: PageText[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push({ page: pageNumber, text });
  }
  return pages;
}
