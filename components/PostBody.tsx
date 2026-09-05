import type { ReactNode } from "react";
import type { PortableTextBlock, PortableTextSpan } from "@/sanity/lib/catalogTypes";
import type { PostBodyBlock, PostImageBlock } from "@/sanity/lib/postTypes";

// Renderizador del cuerpo de una publicación. Sigue el enfoque manual de
// SimplePortableText (sin añadir dependencias) pero añade lo que un artículo
// necesita y una ficha de producto no: listas reales y fotos intercaladas.

function renderSpan(span: PortableTextSpan, markDefs: PortableTextBlock["markDefs"], index: number) {
  let content: ReactNode = span.text || "";

  for (const mark of span.marks || []) {
    if (mark === "strong") content = <strong>{content}</strong>;
    else if (mark === "em") content = <em>{content}</em>;
    else {
      const definition = markDefs?.find((item) => item._key === mark);
      if (definition?._type === "link" && definition.href) {
        const external = definition.href.startsWith("http://") || definition.href.startsWith("https://");
        content = (
          <a href={definition.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
            {content}
          </a>
        );
      }
    }
  }

  return <span key={span._key || `span-${index}`}>{content}</span>;
}

function renderChildren(block: PortableTextBlock) {
  return (block.children || []).map((span, index) => renderSpan(span, block.markDefs, index));
}

function PostImage({ block }: { block: PostImageBlock }) {
  return (
    <figure className="post-figure">
      <img src={block.src} alt={block.alt} width={block.width} height={block.height} loading="lazy" decoding="async" />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

// Los ítems de lista llegan como bloques sueltos con `listItem`; se agrupan en
// una sola <ul>/<ol> para que el HTML sea semántico y legible por lectores de
// pantalla, en lugar de párrafos con una viñeta dibujada.
type ListRun = { type: "bullet" | "number"; blocks: PortableTextBlock[] };

export function PostBody({ value }: { value: PostBodyBlock[] }) {
  if (!value.length) return null;

  const rendered: ReactNode[] = [];
  let list: ListRun | null = null;

  const flushList = () => {
    if (!list) return;
    const items = list.blocks.map((block, index) => (
      <li key={block._key || `item-${index}`}>{renderChildren(block)}</li>
    ));
    rendered.push(
      list.type === "bullet" ? (
        <ul key={`list-${rendered.length}`}>{items}</ul>
      ) : (
        <ol key={`list-${rendered.length}`}>{items}</ol>
      ),
    );
    list = null;
  };

  value.forEach((entry, index) => {
    if (entry._type === "image") {
      flushList();
      rendered.push(<PostImage key={entry._key || `image-${index}`} block={entry as PostImageBlock} />);
      return;
    }

    const block = entry as PortableTextBlock;
    if (block._type !== "block") return;

    const listType = block.listItem === "bullet" || block.listItem === "number" ? block.listItem : null;
    if (listType) {
      if (list && list.type !== listType) flushList();
      if (!list) list = { type: listType, blocks: [] };
      list.blocks.push(block);
      return;
    }

    flushList();
    const key = block._key || `block-${index}`;
    const children = renderChildren(block);

    if (block.style === "h2") rendered.push(<h2 key={key}>{children}</h2>);
    else if (block.style === "h3") rendered.push(<h3 key={key}>{children}</h3>);
    else if (block.style === "blockquote") rendered.push(<blockquote key={key}>{children}</blockquote>);
    else rendered.push(<p key={key}>{children}</p>);
  });

  flushList();

  // Sin `portable-copy`: .post-body trae sus propios estilos y así el artículo
  // no depende de reglas pensadas para las fichas de producto.
  return <div className="post-body">{rendered}</div>;
}
