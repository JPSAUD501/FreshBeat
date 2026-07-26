# ADR 0002: i18n tipado com fallback inline pt-BR

- **Status:** Aceito
- **Data:** 2026-07-26

## Contexto

O bot precisa falar pt-BR, en-US, ja-JP e es-ES. O projeto anterior (MelodyScout) provou um padrão útil: o texto pt-BR vive inline no código e serve de fallback, com chaves extraídas para tradução. Mas lá o catálogo não era tipado — idiomas ficavam desatualizados sem ninguém perceber.

## Decisão

1. Mensagens declaradas com `msg({ key, value })` — `value` é o texto pt-BR padrão, inline no código.
2. `packages/i18n` tem um catálogo por idioma; os idiomas não-base são tipados como `Record<MessageKey, string>` derivado da base pt-BR — **o type-check falha se faltar tradução**.
3. Cadeia de fallback: catálogo do idioma → catálogo pt-BR → `value` inline.
4. Testes garantem paridade de chaves e de placeholders `{{var}}` entre os 4 idiomas.
5. Nomes de comandos são sempre em inglês; descrições são traduzidas via `setMyCommands` por `language_code`.
6. Crowdin (a reintegrar) sincroniza o catálogo pt-BR como fonte das traduções.

## Consequências

- Positivas: impossível mergear idioma incompleto; novas mensagens funcionam imediatamente em pt-BR antes da tradução.
- Negativas: catálogos no repositório exigem sync com Crowdin; placeholders precisam ser mantidos idênticos em todas as línguas (garantido por teste).
