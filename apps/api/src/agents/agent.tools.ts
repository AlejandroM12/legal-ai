import { ToolDefinition } from '../ai/ai.types';

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'search_documents',
    description: 'Busca documentos del usuario por nombre.',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },
  {
    name: 'search_chunks',
    description:
      'Busca fragmentos del usuario por significado. Acepta documentId opcional.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        documentId: { type: 'string' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_document',
    description: 'Devuelve metadata de un documento propio.',
    parameters: {
      type: 'object',
      properties: { documentId: { type: 'string' } },
      required: ['documentId'],
    },
  },
  {
    name: 'get_page',
    description: 'Devuelve el texto de una página de un documento propio.',
    parameters: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        page: { type: 'number' },
      },
      required: ['documentId', 'page'],
    },
  },
  {
    name: 'generate_report',
    description:
      'Arma un informe con la evidencia ya recuperada. El texto de findings no es una fuente nueva.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        findings: { type: 'string' },
      },
      required: ['title', 'findings'],
    },
  },
];

export function textArg(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}
