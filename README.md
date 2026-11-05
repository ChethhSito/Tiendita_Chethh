# La Tiendita de Chethh

Catálogo personal hecho con Next.js, Supabase y Cloudinary. Las consultas se hacen por WhatsApp; la web no procesa pagos.

Mientras no se configure Supabase, el catálogo muestra seis publicaciones ficticias de `src/lib/mock-products.ts`. La página las identifica como demostración y no ofrece consultas por WhatsApp desde sus fichas. Elimina ese archivo y su importación cuando cargues productos reales.

## Ejecutar

1. Instala dependencias: `npm install`.
2. Copia `.env.example` a `.env.local` y completa las claves.
3. En Supabase, ejecuta `supabase.sql` en el editor SQL. Antes de ejecutarlo, reemplaza `REPLACE_WITH_ADMIN_EMAIL` por el correo que usarás para administrar la tienda.
4. En Supabase Auth, crea el usuario administrador con ese mismo correo. No habilites registros públicos si solo tú publicarás.
5. Ejecuta `npm run dev` y abre `http://localhost:3000`.

El enlace **Administrar** está al pie de la página. Puedes crear publicaciones, subir fotos y cambiar su disponibilidad desde PC o celular.

## Despliegue

El proyecto puede conectarse a Netlify desde un repositorio Git. Configura allí las mismas variables de entorno y despliega la rama principal. Las publicaciones se guardan en Supabase; agregar productos no requiere volver a desplegar.

## Variables

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública de Supabase.
- `ADMIN_EMAIL`: correo autorizado para firmar subidas a Cloudinary.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: credenciales de Cloudinary. La clave secreta queda solo en el servidor.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número local de WhatsApp. El código usa el prefijo peruano `+51`; ajustarlo si el número pertenece a otro país.

No publiques `.env.local` ni las claves privadas.
