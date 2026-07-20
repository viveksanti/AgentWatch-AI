import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';

const allowedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]);

@Injectable()
export class DocumentService {
  async extract(file: Express.Multer.File) {
    if (!allowedTypes.has(file.mimetype)) throw new BadRequestException('Only PDF, DOCX, TXT, and Markdown files are supported');
    let text = '';
    try {
      if (file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: file.buffer });
        try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
      } else if (file.mimetype.includes('wordprocessingml')) {
        text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
      } else {
        text = file.buffer.toString('utf8');
      }
    } catch {
      throw new BadRequestException('The uploaded document could not be read');
    }
    text = text.replace(/\0/g, '').replace(/\r\n/g, '\n').trim();
    if (!text) throw new BadRequestException('The uploaded document contains no readable text');
    return text.slice(0, 60_000);
  }
}
