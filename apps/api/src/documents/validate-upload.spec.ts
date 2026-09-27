import { BadRequestException } from '@nestjs/common';
import { decodeUploadName, PdfUpload, validatePdfUpload } from './validate-upload';

function file(partial: Partial<PdfUpload> = {}): PdfUpload {
  const buffer = Buffer.from('%PDF-1.4');
  return {
    originalname: 'contrato.pdf',
    mimetype: 'application/pdf',
    size: buffer.length,
    buffer,
    ...partial,
  };
}

describe('validatePdfUpload', () => {
  it('accepts a pdf owned by the request', () => {
    expect(validatePdfUpload(file({}), 1000)).toBe('contrato.pdf');
  });

  it('recovers a utf-8 filename that arrived as latin1', () => {
    const original = 'Nota de Reclamo – Equipo Don Toti.pdf';
    const mojibake = Buffer.from(original, 'utf8').toString('latin1');
    expect(decodeUploadName(mojibake)).toBe(original);
    expect(decodeUploadName('compra.pdf')).toBe('compra.pdf');
  });

  it('rejects other extensions and oversized files', () => {
    expect(() =>
      validatePdfUpload(file({ originalname: 'nota.txt' }), 1000),
    ).toThrow(BadRequestException);
    expect(() => validatePdfUpload(file({ size: 5000 }), 100)).toThrow(
      BadRequestException,
    );
  });
});
