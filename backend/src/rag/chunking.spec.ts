import { chunkText, estimateTokenCount } from './chunking';

describe('chunkText', () => {
  it('agrupa párrafos cortos en un solo chunk mientras no se exceda maxChars', () => {
    const text = 'Primer párrafo.\n\nSegundo párrafo.\n\nTercer párrafo.';

    const chunks = chunkText(text, 1000);

    expect(chunks).toEqual([
      'Primer párrafo.\n\nSegundo párrafo.\n\nTercer párrafo.',
    ]);
  });

  it('separa en varios chunks cuando el acumulado excede maxChars', () => {
    const text = 'A'.repeat(50) + '\n\n' + 'B'.repeat(50);

    const chunks = chunkText(text, 60);

    expect(chunks).toEqual(['A'.repeat(50), 'B'.repeat(50)]);
  });

  it('corta a la fuerza un párrafo único que por sí solo excede maxChars', () => {
    const text = 'X'.repeat(25);

    const chunks = chunkText(text, 10);

    expect(chunks).toEqual(['X'.repeat(10), 'X'.repeat(10), 'X'.repeat(5)]);
  });

  it('ignora párrafos vacíos y nunca devuelve fragmentos vacíos', () => {
    const chunks = chunkText('  \n\n\n\n  ', 1000);

    expect(chunks).toEqual([]);
  });

  it('devuelve [] para texto vacío', () => {
    expect(chunkText('', 1000)).toEqual([]);
  });
});

describe('estimateTokenCount', () => {
  it('aproxima ~4 caracteres por token', () => {
    expect(estimateTokenCount('12345678')).toBe(2);
    expect(estimateTokenCount('123')).toBe(1);
    expect(estimateTokenCount('')).toBe(0);
  });
});
