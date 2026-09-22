import type { PortableTextBlock } from "@/sanity/lib/catalogTypes";

// En la carga inicial de Productos de Origen se incluyeron por error notas de
// coordinación interna. La sustitución exacta mantiene el texto público limpio
// incluso si Sanity ya tiene publicada la versión anterior del contenido.
// No modifica mensajes nuevos que el cliente redacte posteriormente en Studio.
const publicDescriptions = new Map<string, string>([
  [
    "Chocolate de alto porcentaje de cacao y panela. Sabores indicados por Francisco: Capuchino, Stevia, Aguaymanto, Kiwicha y Nibs.",
    "Chocolate de alto porcentaje de cacao y panela. Sabores: Capuchino, Stevia, Aguaymanto, Kiwicha y Nibs.",
  ],
  [
    "Polvo de cacao mostrado en las fotografías enviadas por Francisco. Precio pendiente de confirmación.",
    "Cacao en polvo.",
  ],
  [
    "Nibs de cacao mostrados en las fotografías enviadas por Francisco. Precio pendiente de confirmación.",
    "Nibs de cacao.",
  ],
  [
    "Cancha Paccho tradicional. El documento entregado por Francisco no consigna precio.",
    "Cancha Paccho tradicional.",
  ],
  [
    "Mix de frutos secos. El documento entregado por Francisco no consigna precio.",
    "Mix de frutos secos.",
  ],
]);

export function publicCatalogCopy(value: string): string {
  return publicDescriptions.get(value.trim()) ?? value;
}

export function publicCatalogPortableText(blocks: PortableTextBlock[]): PortableTextBlock[] {
  return blocks.map((block) => ({
    ...block,
    children: block.children?.map((child) => ({
      ...child,
      text: child.text ? publicCatalogCopy(child.text) : child.text,
    })),
  }));
}