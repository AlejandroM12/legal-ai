import { BadRequestException } from '@nestjs/common';
import { validatePdfUpload } from './validate-upload';

function file(partial: Partial<Express.Multer.File>): Express.Multer.File {
  const buffer = Buffer.from('%PDF-1.4');
  return {
    originalname: 'contrato.pdf',
    mimetype: 'application/pdf',
    size: buffer.length,
    buffer,
    fieldname: 'file',
    encoding: '7bit',
    stream: undefined as never,
    destination: '',
    filename: '',
    path: '',
    ...partial,
  };
}

describe('validatePdfUpload', () => {
  it('accepts a pdf owned by the request', () => {
    expect(validatePdfUpload(file({}), 1000)).toBe('contrato.pdf');
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
