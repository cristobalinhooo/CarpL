# ADR-004 — `pgvector` sobre PostgreSQL vs. base de datos vectorial dedicada para RAG

**Estado:** Aceptado — decisión ya reflejada en el código desde la Fase
5b, formalizada aquí per Technical Spec §17.10 al cerrar la Fase 8.

## Contexto

El RAG técnico (Technical Spec §9.8, PRD v3.2 Actualización v3.1 punto
5) necesita búsqueda por similitud vectorial sobre `DocumentChunk` para
recuperar documentación técnica relevante durante una investigación.

## Decisión

Usar la extensión `pgvector` sobre el mismo PostgreSQL ya usado para el
resto del dominio (`DocumentChunk.embedding: Unsupported("vector(1536)")`),
en vez de introducir una base de datos vectorial dedicada (Pinecone,
Weaviate, Qdrant, etc.). `DocumentRetrievalService` construye la
consulta vía template literal parametrizado de Prisma (`ORDER BY
embedding <=> ...`), nunca concatenación de strings.

## Consecuencias

- Una sola base de datos que operar/respaldar/monitorear — coherente
  con D-007 (simple y barato para la beta privada).
- El corpus actual es mínimo por decisión de alcance (Fase 5b, corpus
  vacío por diseño) — la escalabilidad de `pgvector` con un corpus
  grande no está probada todavía. Riesgo ya registrado explícitamente en
  el Technical Spec (§16.4): "monitorizar latencia de búsqueda
  vectorial; documentar umbral a partir del cual se evaluaría un motor
  vectorial dedicado" — ese umbral es la señal de cuándo reabrir esta
  decisión, no una fecha fija.
- Migrar a una base vectorial dedicada más adelante requeriría
  reemplazar solo `DocumentRetrievalService`/`DocumentIngestionService`
  (el resto del dominio nunca consulta `DocumentChunk` directamente).

## Alternativas consideradas

- **Base de datos vectorial dedicada desde el MVP**: descartada —
  complejidad operativa adicional (otro servicio, otra conexión, otro
  backup) sin necesidad demostrada al tamaño de corpus actual (mínimo,
  por decisión explícita de alcance).
