# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Dialecto: español chileno/neutro, siempre

Todo texto en español visible al usuario en `mobile/` — botones,
mensajes de error, textos de ayuda, placeholders, títulos — se escribe
en **español neutro/chileno ("tú"), nunca en voseo rioplatense**. Nunca
"vos", "tenés", "podés", "escribí", "confirmá", "revisá", etc.

**Por qué esta regla existe:** varias pantallas (Fases 2-5) se
escribieron en voseo antes de que nadie definiera el dialecto
explícitamente — D-022 corrigió esto en el prompt de la IA, pero el
texto fijo de la UI se arregló recién después, por separado, al
encontrarse duplicado en 10 archivos.

**Antes de escribir texto nuevo:**
1. Revisa `mobile/src/constants/messages.ts` — si el mensaje que necesitás
   ya existe ahí (network error, validación de marca/modelo/año, etc.),
   impórtalo en vez de escribir el string de nuevo.
2. Si vas a escribir un mensaje que es razonable que se repita en más de
   una pantalla (errores de red, validaciones genéricas), agrégalo a
   `messages.ts` en vez de escribirlo inline — un solo lugar para
   corregir si el texto necesita un ajuste más adelante.
3. Cuidado con imperativos + pronombre enclítico sin tilde
   ("confirmala", "revisala") — sin tilde se leen como voseo
   ("confirmá" + "la"); la forma neutra correcta lleva tilde
   ("confírmala", "revísala") para conservar el acento original de
   "confirma"/"revisa".
