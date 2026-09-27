import { BadRequestException } from '@nestjs/common';

export function validatePdfUpload(
  file: Express.Multer.File | undefined,
  maxBytes: number,
) {
  if (!file) {
    throw new BadRequestException('Archivo requerido');
  }
  const name = file.originalname.replace(/[/\\]/g, '').trim();
  if (!name || name.length > 255 || name.includes('\0')) {
    throw new BadRequestException('Nombre inválido');
  }
  if (!name.toLowerCase().endsWith('.pdf')) {
    throw new BadRequestException('Extensión inválida');
  }
  if (
    file.mimetype !== 'application/pdf' &&
    file.mimetype !== 'application/octet-stream'
  ) {
    throw new BadRequestException('Tipo inválido');
  }
  if (
    !file.buffer ||
    file.buffer.length < 5 ||
    !file.buffer.subarray(0, 5).toString().startsWith('%PDF')
  ) {
    throw new BadRequestException('El archivo no es un PDF');
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new BadRequestException('Tamaño inválido');
  }
  return name;
}
