# Editar las fotografías rotativas de Personas

Las listas que controlan las imágenes de las cards están en:

```text
data/peopleMedia.ts
```

Dentro encontrarás cuatro arreglos:

```ts
personCardPhotos.pedro
personCardPhotos.fortunato
personCardPhotos.dina
personCardPhotos.vasco
```

Cada fotografía se declara así:

```ts
{
  src: "/media/people/pedro-01.png",
  alt: "Descripción accesible de la fotografía",
  position: "center 38%",
}
```

## Añadir una imagen

1. Copia la imagen a `public/media/people/`.
2. Añade una entrada al arreglo correspondiente en `data/peopleMedia.ts`.
3. Ajusta `position` para cambiar el encuadre dentro de la card.

## Cambiar la velocidad

En el mismo archivo encontrarás:

```ts
export const PERSON_CARD_ROTATION_MS = 3600;
```

El valor está expresado en milisegundos. Por ejemplo, `5000` equivale a cinco segundos.
